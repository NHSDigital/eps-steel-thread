#!/usr/bin/env python
import datetime
import os
from urllib.parse import urlencode

import flask
import httpx
from cryptography.fernet import Fernet

OAUTH_SERVER_BASE_PATH = os.environ["OAUTH_SERVER_BASE_PATH"]
REMOTE_SIGNING_SERVER_BASE_PATH = os.environ["REMOTE_SIGNING_SERVER_BASE_PATH"]
REDIRECT_URI = os.environ["REDIRECT_URI"]
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
APP_NAME = os.environ["APP_NAME"]
SESSION_TOKEN_ENCRYPTION_KEY = os.environ["SESSION_TOKEN_ENCRYPTION_KEY"]

REDIRECT_URL_FOR_STATE = {"sign": "/sign", "verify": "/verify"}

fernet = Fernet(SESSION_TOKEN_ENCRYPTION_KEY.encode('utf-8'))
app = flask.Flask(__name__)


@app.route("/", methods=["GET"])
@app.route("/sign", methods=["GET"])
def get_sign():
    return render_client("sign")


@app.route("/sign", methods=["POST"])
def post_sign():
    return forward_request("sign")


@app.route("/verify", methods=["GET"])
def get_verify():
    return render_client("verify")


@app.route("/verify", methods=["POST"])
def post_verify():
    return forward_request("verify")


@app.route("/login", methods=["GET"])
def get_login():
    state = flask.request.args.get("state", "sign")
    authorize_url = get_authorize_url(state)
    return flask.redirect(authorize_url)


@app.route("/logout", methods=["GET"])
def get_logout():
    state = flask.request.args.get("state", "sign")
    redirect_url = REDIRECT_URL_FOR_STATE.get(state, "sign")
    logout_response = flask.redirect(redirect_url)
    logout_response.set_cookie("Access-Token", "", expires=0)
    return logout_response


@app.route("/callback", methods=["GET"])
def get_callback():
    code = flask.request.args.get("code")
    state = flask.request.args.get("state")

    token_response_json = exchange_code_for_token(code)
    access_token = token_response_json["access_token"]
    expires_in = token_response_json["expires_in"]
    access_token_encrypted = fernet.encrypt(access_token.encode('utf-8')).decode('utf-8')
    expires = datetime.datetime.utcnow() + datetime.timedelta(seconds=float(expires_in))

    redirect_url = REDIRECT_URL_FOR_STATE.get(state, "sign")
    callback_response = flask.redirect(redirect_url)
    callback_response.set_cookie("Access-Token", access_token_encrypted, expires=expires)
    return callback_response


def render_client(page_mode):
    return flask.render_template(
        "client.html",
        page_mode=page_mode
    )


def forward_request(path):
    headers = {
        'Nhsd-Session-Urid': "1234"
    }

    access_token_encrypted = flask.request.cookies.get("Access-Token")
    if access_token_encrypted is not None:
        access_token = fernet.decrypt(access_token_encrypted.encode('utf-8')).decode('utf-8')
        headers['Authorization'] = f"Bearer {access_token}"

    response = httpx.post(
        f"{REMOTE_SIGNING_SERVER_BASE_PATH}{path}",
        json=flask.request.json,
        headers=headers
    )
    return response.content, response.status_code


def get_authorize_url(state):
    query_params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "state": state,
    }
    return f"{OAUTH_SERVER_BASE_PATH}authorize?{urlencode(query_params)}"


def exchange_code_for_token(code):
    token_response = httpx.post(
        f"{OAUTH_SERVER_BASE_PATH}token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    )
    return token_response.json()


if __name__ == "__main__":
    app.run(port=5000, debug=True)
