import datetime
import flask
import os

DEV_MODE = os.environ.get("DEV_MODE", False)


def get_prescription_id_from_cookie():
    return flask.request.cookies.get("Current-Prescription-Id")


def set_prescription_id_cookie(response, short_prescription_id):
    response.set_cookie(
        "Current-Prescription-Id",
        short_prescription_id,
        expires=datetime.datetime.utcnow() + datetime.timedelta(seconds=float(600)),
        secure=not DEV_MODE,
        httponly=True)


def get_auth_method_from_cookie():
    return flask.request.cookies.get("Auth-Method", "cis2")


def set_auth_method_cookie(response, auth_method):
    response.set_cookie(
        "Auth-Method",
        auth_method,
        expires=datetime.datetime.utcnow() + datetime.timedelta(seconds=float(600)),
        secure=not DEV_MODE,
        httponly=True)