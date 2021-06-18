import json
import base64
from sqlalchemy.orm.attributes import flag_modified
from app import db


class PrepareRequest(db.Model):
    id = db.Column(db.Text, primary_key=True)
    body = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return "<PrepareRequest: {}>".format(self.id)


class PrepareResponse(db.Model):
    id = db.Column(db.Text, primary_key=True)
    body = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return "<PrepareResponse: {}>".format(self.id)


class SendRequest(db.Model):
    id = db.Column(db.Text, primary_key=True)
    body = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return "<SendRequest: {}>".format(self.id)


def add_prepare_request(short_prescription_id, prepare_request):
    if PrepareRequest.query.get(short_prescription_id) != None:
        return

    db.session.add(PrepareRequest(id=short_prescription_id, body=prepare_request))
    db.session.commit()


def add_prepare_response(short_prescription_id, prepare_response):
    if PrepareResponse.query.get(short_prescription_id) != None:
        return

    db.session.add(PrepareResponse(id=short_prescription_id, body=prepare_response))
    db.session.commit()


def add_send_request(short_prescription_id, send_request):
    if SendRequest.query.get(short_prescription_id) != None:
        return

    db.session.add(SendRequest(id=short_prescription_id, body=send_request))
    db.session.commit()


def load_prepare_request(short_prescription_id):
    return PrepareRequest.query.get(short_prescription_id).body


def load_prepare_response(short_prescription_id):
    return PrepareResponse.query.get(short_prescription_id).body


def load_send_request(short_prescription_id):
    return SendRequest.query.get(short_prescription_id).body
