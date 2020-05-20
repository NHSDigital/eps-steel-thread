let signRequest = {}
const pageData = {
    examples: [
        new Example("Single line item", EXAMPLE_PRESCRIPTION_SINGLE_LINE_ITEM),
        new Example("Multiple line items", EXAMPLE_PRESCRIPTION_MULTIPLE_LINE_ITEMS)
    ]
}

function Example(description, message) {
    this.description = description
    this.message = message
    this.select = function () {
        selectExample(this)
    }
}

function selectExample(example) {
    signRequest = example.message
    resetPageData()
}

rivets.formatters.snomedCode = function(codings) {
    return codings.filter(coding => coding.system === "http://snomed.info/sct")[0].code
}

rivets.formatters.snomedCodeDescription = function(codings) {
    return codings.filter(coding => coding.system === "http://snomed.info/sct")[0].display
}

rivets.formatters.nhsNumber = function (identifiers) {
    const nhsNumber = identifiers.filter(identifier => identifier.system === "https://fhir.nhs.uk/Id/nhs-number")[0].value;
    return nhsNumber.substring(0, 3) + " " + nhsNumber.substring(3, 6) + " " + nhsNumber.substring(6)
}

rivets.formatters.titleCase = function(string) {
    //TODO length checks
    return string.substring(0, 1).toUpperCase() + string.substring(1)
}

rivets.formatters.fullName = function(name) {
    let names = []
    if (name.family) {
        names = names.concat(name.family.toUpperCase())
    }
    if (name.given) {
        names = names.concat(name.given)
    }
    if (name.prefix) {
        names = names.concat(name.prefix.map(prefix => "(" + prefix + ")"))
    }
    if (name.suffix) {
        names = names.concat(name.suffix.map(suffix => "(" + suffix + ")"))
    }
    return names.join(" ")
}

function sendRequest() {
    const xhr = new XMLHttpRequest()
    xhr.onload = handleResponse
    xhr.onerror = handleError
    xhr.ontimeout = handleTimeout
    xhr.open("POST", "https://internal-dev.api.service.nhs.uk/eps-steel-thread/test/sign")
    xhr.setRequestHeader("Content-Type", "application/json")
    if (pageData.bearerToken && pageData.bearerToken !== "") {
        xhr.setRequestHeader("Authorization", "Bearer " + pageData.bearerToken)
    }
    if (pageData.sessionUrid && pageData.sessionUrid !== "") {
        xhr.setRequestHeader("NHSD-Session-URID", pageData.sessionUrid)
    }
    xhr.send(JSON.stringify(signRequest))
}

function handleResponse() {
    pageData.signResponse = {
        statusCode: this.status,
        statusText: this.statusText,
        body: this.responseText
    }
}

function handleError() {
    addError("Network error")
}

function handleTimeout() {
    addError("Network timeout")
}

window.onerror = function(msg, url, line, col, error) {
    addError("Unhandled error: " + msg);
    return true;
}

function addError(message) {
    console.log(message)
    if (pageData.errorList === null) {
        pageData.errorList = []
    }
    pageData.errorList.push({
        message: message
    })
}

function getSummary(signRequest) {
    return {
        patient: getResourcesOfType(signRequest, "Patient")[0],
        practitioner: getResourcesOfType(signRequest, "Practitioner")[0],
        medicationRequests: getResourcesOfType(signRequest, "MedicationRequest")
    }
}

function getResourcesOfType(prescriptionBundle, resourceType) {
    const resources = prescriptionBundle.entry.map(entry => entry.resource)
    return resources.filter(resource => resource.resourceType === resourceType);
}

function onLoad() {
    pageData.examples[0].select()
    bind()
}

function resetPageData() {
    pageData.signRequestSummary = getSummary(signRequest)
    pageData.signResponse = null
    pageData.errorList = null
    //pageData.bearerToken = null
    //pageData.sessionUrid = null
}

function bind() {
    rivets.bind(document.querySelector('#main-content'), pageData)
}