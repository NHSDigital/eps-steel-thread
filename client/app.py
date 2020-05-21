#!/usr/bin/env python
import os
from urllib.parse import urlencode

import flask
import httpx

app = flask.Flask(__name__)

# Configure
OAUTH_SERVER_BASE_PATH = os.environ["OAUTH_SERVER_BASE_PATH"]
REDIRECT_URI = os.environ["REDIRECT_URI"]
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
APP_NAME = os.environ["APP_NAME"]


@app.route("/", methods=["GET"])
@app.route("/sign", methods=["GET"])
def read_sign():
    return flask.render_template(
        "client.html",
        signin_url=get_signin_url(),
        bearer_token=None,
        page_mode="sign"
    )


@app.route("/verify", methods=["GET"])
def read_verify():
    return flask.render_template(
        "client.html",
        signin_url=get_signin_url(),
        bearer_token=None,
        page_mode="verify"
    )


@app.route("/callback", methods=["GET"])
def do_callback():
    code = flask.request.args.get('code')
    formdata = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    response = httpx.post(OAUTH_SERVER_BASE_PATH + "token", data=formdata)
    response_json = response.json()
    return flask.render_template(
        "client.html",
        signin_url=get_signin_url(),
        bearer_token=response_json["access_token"],
        page_mode="sign"
    )


def get_signin_url():
    query_params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "state": "1234567890",
    }
    return OAUTH_SERVER_BASE_PATH + "authorize?" + urlencode(query_params)


if __name__ == "__main__":
    app.run(port=5000)
