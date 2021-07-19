import flask
import os
import httpx
from urllib.parse import urlencode
from app import app, fernet
import config

DEV_MODE = os.environ.get("DEV_MODE", False)

DEMO_APP_CLIENT_ID = os.environ["DEMO_APP_CLIENT_ID"]
DEMO_APP_CLIENT_SECRET = os.environ["DEMO_APP_CLIENT_SECRET"]

OAUTH_BASE_PATH = os.environ["OAUTH_BASE_PATH"]
OAUTH_REDIRECT_URI = os.environ["OAUTH_REDIRECT_URI"]

LOAD_URL = "/prescribe/load"
EDIT_URL = "/prescribe/edit"
SIGN_URL = "/prescribe/sign"
SEND_URL = "/prescribe/send"
RELEASE_URL = "/dispense/release"
REDIRECT_URL_FOR_STATE = {"login": "/change-auth", "home": "/"}


def redirect_and_set_cookies(state, access_token_encrypted, refresh_token_encrypted, access_token_expiry, refresh_token_expiry):
    redirect_url = REDIRECT_URL_FOR_STATE.get(state, "home")
    callback_response = flask.redirect(redirect_url)
    secure_flag = not DEV_MODE
    callback_response.set_cookie(
        "Access-Token", access_token_encrypted, expires=refresh_token_expiry, secure=secure_flag, httponly=True
    )
    callback_response.set_cookie(
        "Refresh-Token", refresh_token_encrypted, expires=refresh_token_expiry, secure=secure_flag, httponly=True
    )
    callback_response.set_cookie(
        "Access-Token-Session", "True", expires=access_token_expiry, secure=secure_flag, httponly=True
    )
    callback_response.set_cookie("Access-Token-Set", "true", expires=refresh_token_expiry, secure=secure_flag)
    return callback_response


def get_oauth_base_path(auth_method):
    if auth_method == "simulated" and config.ENVIRONMENT == "int":
        return f"{OAUTH_BASE_PATH}-no-smartcard"
    else:
        return f"{OAUTH_BASE_PATH}"


def exchange_code_for_token(code, auth_method):
    oauth_base_path = get_oauth_base_path(auth_method)
    token_response = httpx.post(
        f"{oauth_base_path}/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": OAUTH_REDIRECT_URI,
            "client_id": DEMO_APP_CLIENT_ID,
            "client_secret": DEMO_APP_CLIENT_SECRET,
        },
    )
    return token_response.json()

def refresh_token_session(refresh_token, auth_method):
    oauth_base_path = get_oauth_base_path(auth_method)
    token_response = httpx.post(
        f"{oauth_base_path}/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "redirect_uri": OAUTH_REDIRECT_URI,
            "client_id": DEMO_APP_CLIENT_ID,
            "client_secret": DEMO_APP_CLIENT_SECRET,
        },
    )
    return token_response.json()


def get_access_token():
    access_token_encrypted = flask.request.cookies.get("Access-Token")
    access_token_session = flask.request.cookies.get("Access-Token-Session")
    refresh_token = flask.request.cookies.get("Refresh-Token")
    auth_method = flask.request.cookies.get("Auth-Method", "cis2")
    if not access_token_session:
        refresh_token_session(refresh_token, auth_method)
    if access_token_encrypted is not None:
        return fernet.decrypt(access_token_encrypted.encode("utf-8")).decode("utf-8")
