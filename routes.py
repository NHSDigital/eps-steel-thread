import uuid
import datetime
import os
import json
import base64
import flask
import httpx
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from functools import wraps
from urllib.parse import urlencode
from api import (
    make_eps_api_prepare_request,
    make_eps_api_process_message_request,
    make_eps_api_release_nominated_pharmacy_request,
    make_sign_api_signature_upload_request,
    make_sign_api_signature_download_request,
)
from app import app, db, fernet
from auth import exchange_code_for_token, get_access_token, redirect_and_set_cookies
from bundle import get_prescription_id, create_provenance
from cookies import (
    get_prescription_id_from_cookie,
    set_previous_prescription_id_cookie,
    set_current_prescription_id_cookie,
    set_next_prescription_id_cookie,
    reset_previous_prescription_id_cookie,
    reset_next_prescription_id_cookie,
    set_prescription_ids_cookie,
    get_prescription_ids_from_cookie,
    get_auth_method_from_cookie,
    set_auth_method_cookie,
)
from client import render_client
from database import (
    PrepareRequest,
    PrepareResponse,
    add_prepare_request,
    add_prepare_response,
    add_send_request,
    load_prepare_request,
    load_prepare_response,
    load_send_request,
)

DEV_MODE = os.environ.get("DEV_MODE", False)

DEMO_BASE_PATH = os.environ["DEMO_BASE_PATH"]

DEMO_APP_CLIENT_ID = os.environ["DEMO_APP_CLIENT_ID"]

OAUTH_BASE_PATH = os.environ["OAUTH_BASE_PATH"]
OAUTH_REDIRECT_URI = os.environ["OAUTH_REDIRECT_URI"]

LOAD_URL = "/prescribe/load"
EDIT_URL = "/prescribe/edit"
SIGN_URL = "/prescribe/sign"
SEND_URL = "/prescribe/send"
CANCEL_URL = "/prescribe/cancel"
DISPENSE_RELEASE_NOMINATED_PHARMACY_URL = "/dispense/release-nominated-pharmacy"


def exclude_from_auth(*args, **kw):
    def wrapper(endpoint_method):
        endpoint_method._exclude_from_auth = False

        @wraps(endpoint_method)
        def wrapped(*endpoint_args, **endpoint_kw):
            return endpoint_method(*endpoint_args, **endpoint_kw)

        return wrapped

    return wrapper


@app.before_request
def auth_check():
    if "/static/" in flask.request.path:
        return

    flask.g.skip_auth = False

    if flask.request.endpoint in app.view_functions:
        view_func = app.view_functions[flask.request.endpoint]
        flask.g.skip_auth = hasattr(view_func, "_exclude_from_auth")

    if not flask.g.skip_auth:
        access_token_encrypted = flask.request.cookies.get("Access-Token")
        if access_token_encrypted is not None:
            try:
                fernet.decrypt(access_token_encrypted.encode("utf-8")).decode("utf-8")
            except:
                return login()
        else:
            return login()


def login():
    state = flask.request.args.get("state", "home")
    auth_method = get_auth_method_from_cookie()
    authorize_url = get_authorize_url(state, auth_method)
    response = flask.redirect(authorize_url)
    return response


def get_oauth_base_path(auth_method):
    if auth_method == "simulated":
        return f"{OAUTH_BASE_PATH}-no-smartcard"
    else:
        return f"{OAUTH_BASE_PATH}"


def get_authorize_url(state, auth_method):
    oauth_base_path = get_oauth_base_path(auth_method)

    query_params = {
        "client_id": DEMO_APP_CLIENT_ID,
        "redirect_uri": OAUTH_REDIRECT_URI,
        "response_type": "code",
        "state": state,
    }
    return f"{oauth_base_path}/authorize?{urlencode(query_params)}"


@app.route("/login", methods=["GET"])
@exclude_from_auth()
def get_login():
    return render_client("login")


@app.route("/login", methods=["POST"])
@exclude_from_auth()
def post_login():
    login_request = flask.request.json
    auth_method = login_request["authMethod"]
    response = app.make_response({"redirectUri": "/"})
    secure_flag = not DEV_MODE
    set_auth_method_cookie(response, auth_method)
    response.set_cookie("Access-Token", "", expires=0, secure=secure_flag, httponly=True)
    response.set_cookie("Access-Token-Set", "false", expires=0, secure=secure_flag)
    return response


@app.route("/", methods=["GET"])
@app.route("/home", methods=["GET"])
def get_home():
    return render_client("home")


@app.route(LOAD_URL, methods=["GET"])
def get_load():
    return render_client("load")


def update_pagination(response, short_prescription_ids, current_short_prescription_id):
    set_prescription_ids_cookie(response, short_prescription_ids)
    previous_short_prescription_id_index = short_prescription_ids.index(current_short_prescription_id) - 1
    next_short_prescription_id_index = previous_short_prescription_id_index + 2
    if previous_short_prescription_id_index >= 0:
        set_previous_prescription_id_cookie(response, short_prescription_ids[previous_short_prescription_id_index])
    else:
        reset_previous_prescription_id_cookie(response)
    if next_short_prescription_id_index < len(short_prescription_ids):
        set_next_prescription_id_cookie(response, short_prescription_ids[next_short_prescription_id_index])
    else:
        reset_next_prescription_id_cookie(response)
    set_current_prescription_id_cookie(response, current_short_prescription_id)


@app.route(EDIT_URL, methods=["GET"])
def get_edit():
    current_short_prescription_id = flask.request.args.get("prescription_id")
    bundle = load_prepare_request(current_short_prescription_id)
    response = app.make_response(bundle)
    short_prescription_ids = get_prescription_ids_from_cookie()
    update_pagination(response, short_prescription_ids, current_short_prescription_id)
    return response


@app.route(EDIT_URL, methods=["POST"])
def post_edit():
    request_bundles = flask.request.json
    short_prescription_ids = []
    for bundle in request_bundles:
        short_prescription_id = get_prescription_id(bundle)
        short_prescription_ids.append(short_prescription_id)
        add_prepare_request(short_prescription_id, bundle)
    first_bundle = request_bundles[0]
    current_short_prescription_id = get_prescription_id(first_bundle)
    response = app.make_response(first_bundle)
    update_pagination(response, short_prescription_ids, current_short_prescription_id)
    return response


@app.route(SIGN_URL, methods=["GET"])
def get_sign():
    return render_client("sign")


@app.route(SIGN_URL, methods=["POST"])
def post_sign():
    short_prescription_id = get_prescription_id_from_cookie()
    prepare_request = load_prepare_request(short_prescription_id)
    prepare_response = make_eps_api_prepare_request(get_access_token(), prepare_request)
    auth_method = get_auth_method_from_cookie()
    sign_response = make_sign_api_signature_upload_request(
        auth_method, get_access_token(), prepare_response["digest"], prepare_response["algorithm"]
    )
    print("Response from Signing Service signature upload request...")
    print(json.dumps(sign_response))
    response = app.make_response({"redirectUri": sign_response["redirectUri"]})
    add_prepare_response(short_prescription_id, prepare_response)
    return response


@app.route(SEND_URL, methods=["GET"])
def get_send():
    auth_method = get_auth_method_from_cookie()
    signature_response_json = make_sign_api_signature_download_request(
        auth_method, get_access_token(), flask.request.args.get("token")
    )
    short_prescription_id = get_prescription_id_from_cookie()
    prepare_response = load_prepare_response(short_prescription_id)
    payload = prepare_response["digest"]
    signature = signature_response_json["signature"]
    certifcate = signature_response_json["certificate"]
    payload_decoded = (
        base64.b64decode(payload)
        .decode("utf-8")
        .replace('<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">', "<SignedInfo>")
    )
    xml_dsig = (
        f'<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">{payload_decoded}'
        f"<SignatureValue>{signature}</SignatureValue>"
        f"<KeyInfo><X509Data><X509Certificate>{certifcate}</X509Certificate></X509Data></KeyInfo>"
        f"</Signature>"
    )
    xml_dsig_encoded = base64.b64encode(xml_dsig.encode()).decode()
    prepare_request = load_prepare_request(short_prescription_id)
    provenance = create_provenance(prepare_response["timestamp"], xml_dsig_encoded)
    prepare_request["entry"].append(provenance)
    send_request = prepare_request
    add_send_request(short_prescription_id, send_request)
    return render_client("send", sign_response={"signature": xml_dsig_encoded})


@app.route(SEND_URL, methods=["POST"])
def post_send():
    short_prescription_id = get_prescription_id_from_cookie()
    send_request = load_send_request(short_prescription_id)
    send_prescription_response = make_eps_api_process_message_request(get_access_token(), send_request)
    print("Send Request to EPS...")
    print(send_request)
    print("Send Response from EPS...")
    print(send_prescription_response.json())
    return {"prescription_id": short_prescription_id, "success": send_prescription_response.status_code == 200}


@app.route(CANCEL_URL, methods=["GET"])
def get_cancel():
    return render_client("cancel")


@app.route(CANCEL_URL, methods=["POST"])
def post_cancel():
    cancel_request = flask.request.json
    short_prescription_id = get_prescription_id(cancel_request)
    cancel_response = make_eps_api_process_message_request(get_access_token(), cancel_request)
    response = app.make_response({"prescription_id": short_prescription_id, "body": cancel_response, "success": True})
    return response


@app.route(DISPENSE_RELEASE_NOMINATED_PHARMACY_URL, methods=["GET"])
def get_nominated_pharmacy():
    return render_client("release-nominated-pharmacy")


@app.route(DISPENSE_RELEASE_NOMINATED_PHARMACY_URL, methods=["POST"])
def post_nominated_pharmacy():
    nominated_pharmacy_release = flask.request.json
    ods_code = nominated_pharmacy_release["odsCode"]
    response = make_eps_api_release_nominated_pharmacy_request(
        get_access_token(),
        {
            "resourceType": "Parameters",
            "id": str(uuid.uuid4()),
            "parameter": [
                {
                    "name": "owner",
                    "valueIdentifier": {"system": "https://fhir.nhs.uk/Id/ods-organization-code", "value": ods_code},
                },
                {"name": "status", "valueCode": "accepted"},
            ],
        },
    )
    if response.status_code == 200:
        status = "Success"
    else:
        status = "Failure"
    return {"body": json.dumps(response.json()), "status": status}


@app.route("/logout", methods=["GET"])
def get_logout():
    return redirect_and_set_cookies("login", "", 0)


@app.route("/callback", methods=["GET"])
@exclude_from_auth()
def get_callback():
    state = flask.request.args.get("state", "home")
    code = flask.request.args.get("code")
    auth_method = get_auth_method_from_cookie()
    token_response_json = exchange_code_for_token(code, auth_method)
    access_token = token_response_json["access_token"]
    expires_in = token_response_json["expires_in"]
    access_token_encrypted = fernet.encrypt(access_token.encode("utf-8")).decode("utf-8")
    expires = datetime.datetime.utcnow() + datetime.timedelta(seconds=float(expires_in))
    return redirect_and_set_cookies(state, access_token_encrypted, expires)
