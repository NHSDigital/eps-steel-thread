import flask

def render_client(page_mode, sign_response=None, send_response=None, release_response=None):
    return flask.render_template(
        "client.html",
        page_mode=page_mode,
        sign_response=sign_response,
        send_response=send_response,
        release_response=release_response
    )
