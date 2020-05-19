let signRequest = ExamplePrescription
let signRequestSummary = {}
let signResponse = {}
let boundViews = []

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

function getResourcesOfType(prescriptionBundle, resourceType) {
    const resources = prescriptionBundle.entry.map(entry => entry.resource)
    return resources.filter(resource => resource.resourceType === resourceType);
}

function sendRequest() {
    const xhr = new XMLHttpRequest()
    xhr.onload = handleResponse
    xhr.open("POST", "https://internal-dev.api.service.nhs.uk/eps-steel-thread/sign")
    const bearerToken = document.getElementById("bearer-token").value
    if (bearerToken !== "") {
        xhr.setRequestHeader("Authorization", "Bearer " + bearerToken)
    }
    xhr.send(JSON.stringify(signRequest))
}

function handleResponse() {
    signResponse = {
        statusCode: this.status,
        statusText: this.statusText,
        body: this.responseText
    }
    reBind()
    setResponseVisible(true);
}

function populateSummary() {
    signRequestSummary = {
        patient: getResourcesOfType(signRequest, "Patient")[0],
        practitioner: getResourcesOfType(signRequest, "Practitioner")[0],
        medicationRequests: getResourcesOfType(signRequest, "MedicationRequest")
    }
}

function reBind() {
    boundViews.forEach(binding => binding.unbind())
    boundViews = [
        rivets.bind(document.querySelector('#request-summary'), signRequestSummary),
        rivets.bind(document.querySelector('#response'), signResponse)
    ]
}

function reset() {
    populateSummary();
    signResponse = {}
    setResponseVisible(false)
    reBind()
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