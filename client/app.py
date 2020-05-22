#!/usr/bin/env python
import datetime
import os
from urllib.parse import urlencode

import flask
import httpx
from cryptography.fernet import Fernet

# Configure
OAUTH_SERVER_BASE_PATH = os.environ["OAUTH_SERVER_BASE_PATH"]
REMOTE_SIGNING_SERVER_BASE_PATH = os.environ["REMOTE_SIGNING_SERVER_BASE_PATH"]
REDIRECT_URI = os.environ["REDIRECT_URI"]
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
APP_NAME = os.environ["APP_NAME"]
SESSION_TOKEN_ENCRYPTION_KEY = os.environ["SESSION_TOKEN_ENCRYPTION_KEY"]

fernet = Fernet(SESSION_TOKEN_ENCRYPTION_KEY.encode('utf-8'))
app = flask.Flask(__name__)


@app.route("/", methods=["GET"])
@app.route("/sign", methods=["GET"])
def read_sign():
    return flask.render_template(
        "client.html",
        signin_url=get_signin_url("sign"),
        page_mode="sign"
    )


@app.route("/sign", methods=["POST"])
def forward_sign():
    access_token_encrypted = flask.request.cookies.get("Access-Token")
    if access_token_encrypted is None:
        return {"error": "Access-Token cookie is required"}, 400
    access_token = fernet.decrypt(access_token_encrypted.encode('utf-8')).decode('utf-8')

    response = httpx.post(
        REMOTE_SIGNING_SERVER_BASE_PATH + "sign",
        json=flask.request.json,
        headers={
            'Nhsd-Session-Urid': "1234",
            'Authorization': "Bearer " + access_token
        }
    )
    return response.content


@app.route("/verify", methods=["GET"])
def read_verify():
    return flask.render_template(
        "client.html",
        signin_url=get_signin_url("verify"),
        page_mode="verify"
    )


@app.route("/verify", methods=["POST"])
def forward_verify():
    access_token_encrypted = flask.request.cookies.get("Access-Token")
    if access_token_encrypted is None:
        return {"error": "Access-Token cookie is required"}, 400
    access_token = fernet.decrypt(access_token_encrypted.encode('utf-8')).decode('utf-8')

    response = httpx.post(
        REMOTE_SIGNING_SERVER_BASE_PATH + "verify",
        json=flask.request.json,
        headers={
            'Nhsd-Session-Urid': "1234",
            'Authorization': "Bearer " + access_token
        }
    )
    return response.content


@app.route("/callback", methods=["GET"])
def do_callback():
    code = flask.request.args.get('code')
    state = flask.request.args.get('state')

    token_response = httpx.post(
        OAUTH_SERVER_BASE_PATH + "token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    )

    token_response_json = token_response.json()
    access_token = token_response_json["access_token"]
    expires_in = token_response_json["expires_in"]
    access_token_encrypted = fernet.encrypt(access_token.encode('utf-8')).decode('utf-8')
    expires = datetime.datetime.utcnow() + datetime.timedelta(seconds=float(expires_in))

    callback_response = flask.redirect("/" + state, 302)
    callback_response.set_cookie("Access-Token", access_token_encrypted, expires=expires)
    return callback_response


def get_signin_url(state):
    query_params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "state": state,
    }
    return OAUTH_SERVER_BASE_PATH + "authorize?" + urlencode(query_params)


if __name__ == "__main__":
    app.run(port=5000)
