def main_handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello, world",
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }