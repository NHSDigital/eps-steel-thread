from flask import Flask
import serverless_wsgi

def main_handler(event, context):
    app = Flask(__name__)
    request = serverless_wsgi.handle_request(app, event, context)

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