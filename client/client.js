const RequestMethods = Object.freeze({
    GET: "GET",
    POST: "POST"
})

function sendRequest() {
    const xhr = new XMLHttpRequest();
    xhr.onload = handleResponse
    const requestMethod = getRequestMethod();
    xhr.open(requestMethod, getRequestUrl());
    if (shouldIncludeRequestBody(requestMethod)) {
        xhr.send(getRequestBody());
    } else {
        xhr.send(null);
    }
}

function handleResponse() {
    setResponseStatus(this.status + " " + this.statusText)
    setResponseBody(this.responseText)
    setResponseVisible(true);
}

function reset() {
    setRequestUrl("https://z1cd3i3sn5.execute-api.eu-west-2.amazonaws.com/test/")
    populateRequestMethodList()
    requestMethodChanged()
    setResponseBody("")
    setResponseStatus("")
    setResponseVisible(false)
}

function getRequestUrl() {
    return document.getElementById("request-url").value
}

function setRequestUrl(value) {
    document.getElementById("request-url").value = value
}

function getRequestMethod() {
    return document.getElementById("request-method").value
}

function populateRequestMethodList() {
    let request_method = document.getElementById("request-method");
    request_method.options.length = 0
    for (const method in RequestMethods) {
        const option = document.createElement("option");
        option.text = method
        request_method.add(option)
    }
}

function requestMethodChanged() {
    setRequestBody("")
    const include_request_body = shouldIncludeRequestBody(getRequestMethod());
    setRequestBodyVisible(include_request_body)
}

function shouldIncludeRequestBody(requestMethod) {
    switch (requestMethod) {
        case RequestMethods.GET:
            return false
        case RequestMethods.POST:
            return true
        default:
            console.error("Unhandled request method " + requestMethod)
            return false
    }
}

function getRequestBody() {
    return document.getElementById("request-body").value
}

function setRequestBody(value) {
    document.getElementById("request-body").value = value
}

function setRequestBodyVisible(value) {
    setElementVisible("request-body-field-row", value)
}

function setResponseBody(value) {
    document.getElementById("response-body").innerHTML = value
}

function setResponseStatus(value) {
    document.getElementById("response-status").value = value
}

function setResponseVisible(value) {
    setElementVisible("response", value)
}

function setElementVisible(elementId, visible) {
    const field = document.getElementById(elementId)
    if (visible) {
        field.style.display = "block"
    } else {
        field.style.display = "none"
    }
}