import uuid
import httpx
import os
import time
import json
from jwt import JWT, jwk_from_pem

DEMO_APP_CLIENT_ID = os.environ["DEMO_APP_CLIENT_ID"]
DEMO_APP_KEY_ID = os.environ["DEMO_APP_KEY_ID"]
EPS_BASE_PATH = os.environ["EPS_BASE_PATH"]
SIGNING_BASE_PATH = os.environ["SIGNING_BASE_PATH"]

# patch for RSS support whilst requirements for local signing and RSS are different
# todo: use same private key for remote and local signing
DEMO_APP_LOCAL_SIGNING_PRIVATE_KEY = os.environ["DEMO_APP_PRIVATE_KEY"]
DEMO_APP_REMOTE_SIGNING_PRIVATE_KEY = os.environ["RSS_JWT_PRIVATE_KEY"]
DEMO_APP_REMOTE_SIGNING_SUBJECT = os.environ["RSS_JWT_SUBJECT"]
DEMO_APP_REMOTE_SIGNING_ISSUER = os.environ["RSS_JWT_ISSUER"]
DEMO_APP_REMOTE_SIGNING_KID = os.environ["RSS_JWT_KID"]


def make_eps_api_prepare_request(access_token, body):
    response = make_eps_api_request("$prepare", access_token, body)
    response_json = response.json()
    print("Response from EPS prepare request...")
    print(json.dumps(response_json))
    return {p["name"]: p["valueString"] for p in response_json["parameter"]}


def make_eps_api_process_message_request(access_token, body):
    return make_eps_api_request("$process-message", access_token, body)


def make_eps_api_convert_message_request(access_token, body):
    return make_eps_api_request("$convert", access_token, body)


def make_eps_api_release_nominated_pharmacy_request(access_token, body):
    return make_eps_api_request("Task/$release", access_token, body)


def make_eps_api_request(path, access_token, body):
    return httpx.post(
        f"{EPS_BASE_PATH}/{path}",
        headers={
            "x-request-id": str(uuid.uuid4()),
            "x-correlation-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {access_token}",
        },
        json=body,
        verify=False,
    )


def make_sign_api_signature_upload_request(auth_method, access_token, digest, algorithm):
    jwt_client = JWT()
    signing_base_url = get_signing_base_path(auth_method)

    # patch for RSS support whilst requirements for local signing and RSS are different
    # todo: remove this logic once they are aligned
    if auth_method == "cis2":
        pem = DEMO_APP_LOCAL_SIGNING_PRIVATE_KEY.encode("utf-8")
        sub = DEMO_APP_CLIENT_ID
        iss = DEMO_APP_CLIENT_ID
        kid = DEMO_APP_KEY_ID
    else:  # always 'simulated' (this will only support RSS Windows/IOS, smartcard simulated auth will fail as JWTs are different)
        pem = DEMO_APP_REMOTE_SIGNING_PRIVATE_KEY.encode("utf-8")
        sub = DEMO_APP_REMOTE_SIGNING_SUBJECT
        iss = DEMO_APP_REMOTE_SIGNING_ISSUER
        kid = DEMO_APP_REMOTE_SIGNING_KID

    signing_key = jwk_from_pem(pem)
    jwt_request = jwt_client.encode(
        {
            "sub": sub,
            "iss": iss,
            "aud": signing_base_url,
            "iat": time.time(),
            "exp": time.time() + 600,
            "payload": digest,
            "algorithm": algorithm,
        },
        signing_key,
        alg="RS512",
        optional_headers={"kid": kid},
    )

    print("Sending Signing Service signature upload request...")
    print(jwt_request)

    return httpx.post(
        f"{signing_base_url}/signaturerequest",
        headers={"Content-Type": "text/plain", "Authorization": f"Bearer {access_token}"},
        data=jwt_request,
        verify=False,
    ).json()


def make_sign_api_signature_download_request(auth_method, access_token, token):
    signing_base_url = get_signing_base_path(auth_method)
    return httpx.get(
        f"{signing_base_url}/signatureresponse/{token}",
        headers={"Content-Type": "text/plain", "Authorization": f"Bearer {access_token}"},
        verify=False,
    ).json()


def get_signing_base_path(auth_method):
    if auth_method == "simulated":
        return f"{SIGNING_BASE_PATH}-no-smartcard"
    else:
        return f"{SIGNING_BASE_PATH}"
