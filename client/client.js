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
        changeMessage(message)
    }
}

function changeMessage(message) {
    signRequest = message
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

rivets.formatters.odsCode = function(identifiers) {
    return identifiers.filter(identifier => identifier.system === "https://fhir.nhs.uk/Id/ods-organization-code")[0].value
}

rivets.formatters.titleCase = function(string) {
    //TODO length checks
    return string.substring(0, 1).toUpperCase() + string.substring(1)
}

rivets.formatters.fullName = function(name) {
    return concatenateWithSpacesIfPresent([
        name.family,
        name.given,
        surroundWithParenthesesIfPresent(name.prefix),
        surroundWithParenthesesIfPresent(name.suffix)
    ])
}

rivets.formatters.fullAddress = function (address) {
    return concatenateWithSpacesIfPresent([
        address.line,
        address.city,
        address.district,
        address.state,
        address.postalCode,
        address.country
    ])
}

function concatenateWithSpacesIfPresent(fields) {
    let fieldValues = []
    fields.forEach(field => {
        if (field) {
            fieldValues = fieldValues.concat(field)
        }
    })
    return fieldValues.join(" ")
}

function surroundWithParenthesesIfPresent(fields) {
    if (fields) {
        return fields.map(field => "(" + field + ")")
    } else {
        return fields
    }
}

function sendRequest() {
    const xhr = new XMLHttpRequest()
    xhr.onload = handleResponse
    xhr.onerror = handleError
    xhr.ontimeout = handleTimeout
    xhr.open("POST", "https://internal-dev.api.service.nhs.uk/eps-steel-thread/test/sign")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Authorization", "Bearer " + document.querySelector('#bearer-token').value)
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
    addError("Unhandled error: " + msg + " at " + url + " " + line + ":" + col);
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
    const patient = getResourcesOfType(signRequest, "Patient")[0]
    const practitioner = getResourcesOfType(signRequest, "Practitioner")[0]
    const encounter = getResourcesOfType(signRequest, "Encounter")[0]
    const organizations = getResourcesOfType(signRequest, "Organization")
    const prescribingOrganization = organizations.filter(organization => "urn:uuid:" + organization.id === encounter.serviceProvider.reference)[0]
    const parentOrganization = organizations.filter(organization => "urn:uuid:" + organization.id === prescribingOrganization.partOf.reference)[0]
    const medicationRequests = getResourcesOfType(signRequest, "MedicationRequest")
    return {
        patient: patient,
        practitioner: practitioner,
        encounter: encounter,
        prescribingOrganization: prescribingOrganization,
        parentOrganization: parentOrganization,
        medicationRequests: medicationRequests
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