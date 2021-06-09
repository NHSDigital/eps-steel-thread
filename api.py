import uuid
import httpx
import os
import time
import json
from jwt import JWT, jwk_from_pem

DEMO_APP_CLIENT_ID = os.environ["DEMO_APP_CLIENT_ID"]
DEMO_APP_PRIVATE_KEY = os.environ["DEMO_APP_PRIVATE_KEY"]
DEMO_APP_KEY_ID = os.environ["DEMO_APP_KEY_ID"]
EPS_BASE_PATH = os.environ["EPS_BASE_PATH"]
SIGNING_BASE_PATH = os.environ["SIGNING_BASE_PATH"]


def make_eps_api_prepare_request(access_token, body):
    response = make_eps_api_request("$prepare", access_token, body)
    response_json = response.json()
    return {p['name']: p['valueString'] for p in response_json['parameter']}


def make_eps_api_send_request(access_token, body):
    return make_eps_api_request("$process-message", access_token, body)


def make_eps_api_release_nominated_pharmacy_request(access_token, body):
    return make_eps_api_request("Task/$release", access_token, body)


def make_eps_api_request(path, access_token, body):
    return httpx.post(
        f"{EPS_BASE_PATH}/{path}",
        headers={
            'x-request-id': str(uuid.uuid4()),
            'x-correlation-id': str(uuid.uuid4()),
            'Authorization': f"Bearer {access_token}"
        },
        json=body,
        verify=False
    )


def make_sign_api_signature_upload_request(auth_method, access_token, digest, algorithm):
    jwt_client = JWT()
    signing_key = jwk_from_pem(DEMO_APP_PRIVATE_KEY.encode("utf-8"))
    jwt_request = jwt_client.encode(
        {
            'sub': DEMO_APP_CLIENT_ID,
            'iss': DEMO_APP_CLIENT_ID,
            'aud': SIGNING_BASE_PATH,
            'iat': time.time(),
            'exp': time.time() + 600,
            'payload': digest,
            'algorithm': algorithm
        },
        signing_key,
        alg ="RS512",
        optional_headers = {
            'kid': DEMO_APP_KEY_ID
        }
    )
    signing_base_url = get_signing_base_path(auth_method)
    return httpx.post(
        f"{signing_base_url}/signaturerequest",
        headers={
            'Content-Type': 'text/plain',
            'Authorization': f"Bearer {access_token}"
        },
        data=jwt_request,
        verify=False
    ).json()


def make_sign_api_signature_download_request(auth_method, access_token, token):
    signing_base_url = get_signing_base_path(auth_method)
    return httpx.get(
        f"{signing_base_url}/signatureresponse/{token}",
        headers={
            'Content-Type': 'text/plain',
            'Authorization': f"Bearer {access_token}"
        },
        verify=False
    ).json()


def get_signing_base_path(auth_method):
    if auth_method == "simulated":
        return f"{SIGNING_BASE_PATH}-no-smartcard"
    else:
        return f"{SIGNING_BASE_PATH}"