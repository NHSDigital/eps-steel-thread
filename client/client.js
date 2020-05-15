const RequestMethods = Object.freeze({
    GET: "GET",
    POST: "POST"
})

function send_request() {
    const xhr = new XMLHttpRequest();
    xhr.onload = handle_response
    xhr.open(get_request_method(), get_request_url());
    xhr.send(get_request_body());
}

function handle_response() {
    set_response_status(this.status + " " + this.statusText)
    set_response_status_visible(true)
    set_response_body(this.responseText)
    set_response_body_visible(true);
}

function reset() {
    set_request_url("https://z1cd3i3sn5.execute-api.eu-west-2.amazonaws.com/test/")
    populate_request_method_list()
    set_request_method(RequestMethods.GET)
    request_method_changed()
    set_response_body("")
    set_response_body_visible(false)
    set_response_status("")
    set_response_status_visible(false)
}

function get_request_url() {
    return document.getElementById("request-url").value
}

function set_request_url(value) {
    document.getElementById("request-url").value = value
}

function get_request_method() {
    return document.getElementById("request-method").value
}

function set_request_method(value) {
    document.getElementById("request-method").value = value
}

function populate_request_method_list() {
    let request_method = document.getElementById("request-method");
    request_method.options.length = 0
    for (const method in RequestMethods) {
        const option = document.createElement("option");
        option.text = method
        request_method.add(option)
    }
}

function request_method_changed() {
    set_request_body("")
    switch (get_request_method()) {
        case RequestMethods.GET:
            set_request_body_visible(false)
            break
        case RequestMethods.POST:
            set_request_body_visible(true)
            break
    }
}

function get_request_body() {
    const request_body = document.getElementById("request-body")
    if (request_body.style.display === "none") {
        return null
    } else {
        return request_body.value
    }
}

function set_request_body(value) {
    document.getElementById("request-body").value = value
}

function set_request_body_visible(value) {
    set_field_visible("request-body-field-row", value)
}

function set_response_body(value) {
    document.getElementById("response-body").innerHTML = value
}

function set_response_body_visible(value) {
    set_field_visible("response-body-field-row", value)
}

function set_response_status(value) {
    document.getElementById("response-status").value = value
}

function set_response_status_visible(value) {
    set_field_visible("response-status-field-row", value)
}

function set_field_visible(field_id, visible) {
    const field = document.getElementById(field_id)
    if (visible) {
        field.style.display = "block"
    } else {
        field.style.display = "none"
    }
}