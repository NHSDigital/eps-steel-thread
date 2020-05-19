from flask import Flask
import serverless_wsgi

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
    return {
        "statusCode": 200,
        "body": "Hello, world"
    }

@app.route('/sign', methods=['POST'])
def sign():
    return {
        "statusCode": 200,
        "body": request.body
    }

def main_handler(event, context):
    return serverless_wsgi.handle_request(app, event, context)