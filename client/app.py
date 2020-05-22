#!/usr/bin/env python
import datetime
import os
import random
import string
from urllib.parse import urlencode

import flask
import httpx

app = flask.Flask(__name__)
access_tokens = {}

# Configure
OAUTH_SERVER_BASE_PATH = os.environ["OAUTH_SERVER_BASE_PATH"]
REMOTE_SIGNING_SERVER_BASE_PATH = os.environ["REMOTE_SIGNING_SERVER_BASE_PATH"]
REDIRECT_URI = os.environ["REDIRECT_URI"]
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
APP_NAME = os.environ["APP_NAME"]


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
    session_id = flask.request.cookies.get("Session-Id")
    if session_id is None:
        return {"error": "Session-Id cookie is required"}, 400

    response = httpx.post(
        REMOTE_SIGNING_SERVER_BASE_PATH + "sign",
        json=flask.request.json,
        headers={
            'Nhsd-Session-Urid': "1234",
            'Authorization': "Bearer " + access_tokens[session_id]
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
    session_id = flask.request.cookies.get("Session-Id")
    if session_id is None:
        return {"error": "Session-Id cookie is required"}, 400

    response = httpx.post(
        REMOTE_SIGNING_SERVER_BASE_PATH + "verify",
        json=flask.request.json,
        headers={
            'Nhsd-Session-Urid': "1234",
            'Authorization': "Bearer " + access_tokens[session_id]
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

    callback_response = flask.make_response(
        flask.render_template(
            "client.html",
            signin_url=get_signin_url(state),
            page_mode=state
        )
    )

    session_id = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(32))
    access_tokens[session_id] = token_response_json["access_token"]
    expires_in = token_response_json["expires_in"]
    expires = datetime.datetime.utcnow() + datetime.timedelta(seconds=float(expires_in))
    callback_response.set_cookie("Session-Id", session_id, expires=expires)
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
