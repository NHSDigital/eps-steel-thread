const pageData = {
  examples: [
    // todo: commented out prescriptions either add missing prescription or fix issues in send
    new Prescription(
      "1",
      "Primary Care - Acute (nominated)",
      PRIMARY_CARE_ACUTE_NOMINATED
    ),
    //new Prescription("2", "Primary Care - Repeat Dispensing (nominated)", PRIMARY_CARE_REPEAT_DISPENSING_NOMINATED),
    new Prescription(
      "3",
      "Primary Care - Repeat Prescribing (nominated)",
      PRIMARY_CARE_REPEAT_PRESCRIBING_NOMINATED
    ),
    new Prescription(
      "4",
      "Secondary Care - Acute (nominated)",
      SECONDARY_CARE_COMMUNITY_ACUTE_NOMINATED
    ),
    new Prescription(
      "5",
      "Secondary Care - Acute",
      SECONDARY_CARE_COMMUNITY_ACUTE_NON_NOMINATED
    ),
    //new Prescription("6", "Secondary Care - Repeat Dispensing (nominated)", SECONDARY_CARE_REPEAT_DISPENSING_NOMINATED),
    //new Prescription("7", "Secondary Care - Repeat Prescribing (nominated)", SECONDARY_CARE_REPEAT_PRESCRIBING_NOMINATED),
    new Prescription(
      "8",
      "Homecare - Acute (nominated)",
      HOMECARE_ACUTE_NOMINATED
    ),
    //new Prescription("9", "Homecare - Repeat Dispensing (nominated)", HOMECARE_REPEAT_DISPENSING_NOMINATED),
    //new Prescription("10", "Homecare - Repeat Prescribing (nominated)", HOMECARE_REPEAT_PRESCRIBING_NOMINATED),
    new Prescription("custom", "Custom", null),
  ],
  releases: [
    new Release("all", "All nominated"),
    new Release("custom", "Custom"),
  ],
  pharmacies: [
    new Pharmacy("VNFKT", "FIVE STAR HOMECARE LEEDS LTD"),
    new Pharmacy("YGM1E", "MBBM HEALTHCARE TECHNOLOGIES LTD"),
    new Pharmacy("custom", "Custom", null),
  ],
  actions: [
    new PrescriptionAction("", ""),
    new PrescriptionAction("cancel", "Cancel"),
    new PrescriptionAction("release", "Release"),
    new PrescriptionAction("dispense", "Dispense"),
  ],
  reasons: [
    new CancellationReason("0001", "Prescribing Error"),
    new CancellationReason("0002", "Clinical contra-indication"),
    new CancellationReason("0003", "Change to medication treatment regime"),
    new CancellationReason("0004", "Clinical grounds"),
    new CancellationReason("0005", "At the Patient's request"),
    new CancellationReason("0006", "At the Pharmacist's request"),
    new CancellationReason("0007", "Notification of Death"),
    new CancellationReason("0008", "Patient deducted - other reason"),
    new CancellationReason(
      "0009",
      "Patient deducted - registered with new practice"
    ),
  ],
  cancellers: [
    new Canceller(
      "same-as-original-author",
      "",
      "Use original author",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ),
    new Canceller(
      "R8006",
      "Admin",
      "Medical Secetary Access Role",
      "212304192555",
      "555086718101",
      "https://fhir.hl7.org.uk/Id/professional-code",
      "unknown",
      "MS",
      "Medical",
      "Secetary"
    ),
  ],
  environment: "prod",
  mode: "home",
  signature: "",
  loggedIn: Cookies.get("Access-Token-Set") === "true",
  showCustomExampleInput: false,
  showCustomPharmacyInput: false,
  selectedExampleId: "1",
  selectedCancellationReasonId: "0001",
  selectedCancellerId: "same-as-original-author",
  selectedReleaseId: "all",
  prescriptionId: new URLSearchParams(window.location.search).get(
    "prescription_id"
  ),
  payloads: [],
};

function Prescription(id, description, message) {
  this.id = id;
  this.description = description;
  this.message = message;
  this.select = function () {
    pageData.selectedExampleId = id;
    pageData.showCustomExampleInput = id === "custom";
    resetPageData(pageData.mode);
  };
}

function Pharmacy(id, name) {
  this.id = id;
  this.name = name;
  this.display = id === "custom" ? "Custom" : this.id + " - " + this.name;
  this.select = function () {
    pageData.selectedPharmacy = id;
    pageData.showCustomPharmacyInput = id === "custom";
    resetPageData(pageData.mode);
  };
}

function Release(id, description) {
  this.id = id;
  this.description = description;
  this.select = function () {
    pageData.selectedReleaseId = id;
    pageData.showCustomPrescriptionIdInput = id === "custom";
    resetPageData(pageData.mode);
  };
}

function PrescriptionAction(id, description) {
  this.id = id;
  this.description = description;
}

function CancellationReason(id, display) {
  this.id = id;
  this.display = display;
  this.select = function () {
    pageData.selectedCancellationReasonId = id;
    resetPageData(pageData.mode);
  };
}

function Canceller(
  id,
  type,
  display,
  sdsRoleProfileId,
  sdsUserId,
  professionalCodeSystem,
  professionalCodeValue,
  title,
  firstName,
  lastName
) {
  this.id = id;
  this.type = type;
  this.display = display;
  this.sdsRoleProfileId = sdsRoleProfileId;
  this.sdsUserId = sdsUserId;
  this.professionalCodeSystem = professionalCodeSystem;
  this.professionalCodeValue = professionalCodeValue;
  this.title = title;
  this.firstName = firstName;
  this.lastName = lastName;
  this.description =
    id === "same-as-original-author" ? display : `${type} - ${display}`;
  this.select = function () {
    pageData.selectedCancellerId = id;
    resetPageData(pageData.mode);
  };
}

// handle cases when no data is present without using "?." operator for IE compatibility
// handle filter with function as IE will not accept "=>" operator
rivets.formatters.snomedCode = {
  read: function (codings) {
    return codings.length
      ? codings.filter(function (coding) {
          return coding.system === "http://snomed.info/sct";
        })[0].code
      : "";
  },
  publish: function (value, binding) {
    return binding;
  },
};

rivets.formatters.snomedCodeDescription = {
  read: function (codings) {
    return codings.length
      ? codings.filter(function (coding) {
          return coding.system === "http://snomed.info/sct";
        })[0].display
      : "";
  },
  publish: function (value, binding) {
    return binding;
  },
};

rivets.formatters.prescriptionEndorsements = function (extensions) {
  return extensions
    ? extensions
        .filter(
          (extension) =>
            extension.url ===
            "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionEndorsement"
        )
        .flatMap(
          (prescriptionEndorsement) =>
            prescriptionEndorsement.valueCodeableConcept.coding
        )
        .map((coding) => coding.code)
        .join(", ")
    : "";
};

rivets.formatters.nhsNumber = function (identifiers) {
  if (!identifiers) {
    return "";
  }
  const nhsNumber = identifiers.filter(function (identifier) {
    return identifier.system === "https://fhir.nhs.uk/Id/nhs-number";
  })[0].value;
  return (
    nhsNumber.substring(0, 3) +
    " " +
    nhsNumber.substring(3, 6) +
    " " +
    nhsNumber.substring(6)
  );
};

rivets.formatters.odsCode = function (identifiers) {
  return identifiers
    ? identifiers.filter(function (identifier) {
        return (
          identifier.system === "https://fhir.nhs.uk/Id/ods-organization-code"
        );
      })[0].value
    : "";
};

rivets.formatters.titleCase = function (string) {
  //TODO length checks
  return string
    ? string.substring(0, 1).toUpperCase() + string.substring(1)
    : "";
};

rivets.formatters.dosageInstruction = function (dosageInstructions) {
  return dosageInstructions ? dosageInstructions[0].text : "";
};

rivets.formatters.dispenserNotes = function (notes) {
  return notes
    ?.filter((note) => note.text)
    .map((note) => note.text)
    .join(". ");
};

rivets.formatters.fullName = function (name) {
  if (!name) {
    return "";
  }
  return concatenateIfPresent([
    toUpperCaseIfPresent(name.family),
    name.given,
    surroundWithParenthesesIfPresent(name.prefix),
    surroundWithParenthesesIfPresent(name.suffix),
  ]);
};

rivets.formatters.fullAddress = function (address) {
  return concatenateIfPresent([
    address.line,
    address.city,
    address.district,
    address.state,
    address.postalCode,
    address.country,
  ]);
};

// IE compatibility, unable to use "=>" operator
rivets.formatters.isProd = function (environment) {
  return environment === "prod";
};
rivets.formatters.isLogin = function (mode) {
  return mode === "login";
};
rivets.formatters.isHome = function (mode) {
  return mode === "home";
};
rivets.formatters.isLoad = function (mode) {
  return mode === "load";
};
rivets.formatters.isEdit = function (mode) {
  return mode === "edit";
};
rivets.formatters.isSign = function (mode) {
  return mode === "sign";
};
rivets.formatters.isVerify = function (mode) {
  return mode === "verify";
};
rivets.formatters.isSend = function (mode) {
  return mode === "send";
};
rivets.formatters.isCancel = function (mode) {
  return mode === "cancel";
};
rivets.formatters.isRelease = function (mode) {
  return mode === "release";
};
rivets.formatters.isDispense = function (mode) {
  return mode === "dispense";
};
rivets.formatters.showPharmacyList = function (mode) {
  return mode === "edit" || mode === "release";
};

rivets.formatters.joinWithSpaces = function (strings) {
  return strings.join(" ");
};

rivets.formatters.appendPageMode = function (string) {
  return string + pageData.mode;
};

rivets.formatters.displayEnvironment = function (environment) {
  if (environment === "prod") {
    return "Production"
  } else if (environment === "int") {
    return "Integration"
  } else {
    return environment
  }
};

function concatenateIfPresent(fields) {
  return fields.filter(Boolean).reduce(function (currentValues, valuesToAdd) {
    return currentValues.concat(valuesToAdd);
  }, []);
}

function surroundWithParenthesesIfPresent(fields) {
  if (fields) {
    return fields.map(function (field) {
      return "(" + field + ")";
    });
  } else {
    return fields;
  }
}

function toUpperCaseIfPresent(field) {
  if (field) {
    return field.toUpperCase();
  } else {
    return field;
  }
}

function sendLoadRequest() {
  const isCustom = pageData.selectedExampleId == "custom";
  const filePayloads = pageData.payloads;
  const textPayloads = [document.getElementById("prescription-textarea").value];
  const payloads = filePayloads
    .concat(textPayloads)
    .filter(Boolean)
    .map((payload) => JSON.parse(payload));
  if (isCustom && !payloads.length) {
    addError("Unable to parse custom prescription(s)");
  } else {
    resetPageData("edit");
  }
}

function updateAuthMethod(authMethod) {
  const response = makeRequest(
    "POST",
    "/login",
    JSON.stringify({ authMethod: authMethod })
  );
  window.location.href = response.redirectUri;
}

// IE compatibility
function makeRequest(method, url, body) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url, false);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(body);
  } catch {
    // if we get an undetecable cors error caused by oauth triggering on a post, then redirect to login
    window.location.href = "/login";
  }
  return JSON.parse(xhr.responseText);
}

function getEditRequest(previousOrNext) {
  try {
    const prescriptionId =
      previousOrNext === "previous"
        ? pageData.previous_prescription_id
        : pageData.next_prescription_id;
    const response = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    pageData.previous_prescription_id = Cookies.get("Previous-Prescription-Id");
    pageData.next_prescription_id = Cookies.get("Next-Prescription-Id");
    resetPageData("sign");
    pageData.signRequestSummary = getSummary(response);
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendEditRequest() {
  try {
    const bundles = getPayloads();
    bundles.forEach((bundle) => {
      updateBundleIds(bundle);
      updateNominatedPharmacy(bundle, getOdsCode());
    });
    const response = makeRequest(
      "POST",
      "/prescribe/edit",
      JSON.stringify(bundles)
    );
    resetPageData("sign");
    pageData.signRequestSummary = getSummary(response);
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendSignRequest(skipSignaturePage) {
  try {
    const response = makeRequest(
      "POST",
      "/prescribe/sign",
      JSON.stringify({ skipSignaturePage })
    );
    window.location.href = response.redirectUri;
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendPrescriptionRequest() {
  try {
    const response = makeRequest("POST", "/prescribe/send", {});
    pageData.signResponse = null;
    pageData.sendResponse = {};
    pageData.sendResponse.prescriptionId = response.prescription_id;
    pageData.sendResponse.success = response.success;
    document.getElementById(
      "send-request-download-fhir"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.request, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
    document.getElementById(
      "send-request-download-xml"
    ).href = `data:application/xml,${encodeURIComponent(response.request_xml)}`; // component includes '#' which is present in xml
    document.getElementById(
      "send-response-download"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.response, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendCancelRequest() {
  try {
    const prescriptionId = Cookies.get("Current-Prescription-Id");
    const prescription = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    resetPageData("cancel");
    const cancellation = createCancellation(prescription);
    const response = makeRequest(
      "POST",
      "/prescribe/cancel",
      JSON.stringify(cancellation)
    );
    pageData.cancelResponse = {};
    pageData.cancelResponse.prescriptionId = response.prescription_id;
    pageData.cancelResponse.success = response.success;
    const parsedCancelResponse = JSON.parse(response.response);
    pageData.cancelResponse.prescriber = getPrescriber(
      parsedCancelResponse,
      response.success
    );
    pageData.cancelResponse.canceller = getCanceller(
      parsedCancelResponse,
      response.success
    );
    document.getElementById(
      "cancel-request-download-fhir"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.request, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
    document.getElementById(
      "cancel-request-download-xml"
    ).href = `data:application/xml,${encodeURIComponent(response.request_xml)}`; // component includes '#' which is present in xml
    document.getElementById(
      "cancel-response-download"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.response, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendReleaseRequest() {
  try {
    const prescriptionId =
      pageData.selectedReleaseId === "custom"
        ? document.getElementById("prescription-id-input").value
        : undefined;
    const request = {
      prescriptionId,
      odsCode: getOdsCode(),
    };
    const response = makeRequest(
      "POST",
      "/dispense/release",
      JSON.stringify(request)
    );
    pageData.showCustomPharmacyInput = false;
    pageData.releaseResponse = {};
    pageData.releaseResponse.body = !response.success ? response.body : "";
    pageData.releaseResponse.prescriptions = response.success
      ? JSON.parse(response.body).entry.map(function (entry) {
          const bundle = entry.resource;
          const originalShortFormId = getMedicationRequests(bundle)[0]
            .groupIdentifier.value;
          return { id: originalShortFormId };
        })
      : null;
    pageData.releaseResponse.success = response.success;
    document.getElementById(
      "release-request-download-fhir"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.request, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
    document.getElementById(
      "release-request-download-xml"
    ).href = `data:application/xml,${encodeURIComponent(response.request_xml)}`; // component includes '#' which is present in xml
    document.getElementById(
      "release-response-download"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.response, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function sendDispenseRequest() {
  try {
    const prescriptionId = Cookies.get("Current-Prescription-Id");
    const bundle = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    const dispenseRequest = createDispenseRequest(bundle);
    const response = makeRequest(
      "POST",
      "/dispense/dispense",
      JSON.stringify(dispenseRequest)
    );
    pageData.dispenseResponse = {};
    pageData.dispenseResponse.body = response.body;
    pageData.dispenseResponse.success = response.success;
    document.getElementById(
      "dispense-request-download-fhir"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.request, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
    document.getElementById(
      "dispense-request-download-xml"
    ).href = `data:application/xml,${encodeURIComponent(response.request_xml)}`; // component includes '#' which is present in xml
    document.getElementById(
      "dispense-response-download"
    ).href = `data:application/json,${encodeURI(
      JSON.stringify(response.response, null, 2)
        .replace(/\\/g, "")
        .replace(/"/, "")
        .replace(/.$/, "")
    )}`;
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function getPrescriber(cancelResponse, success) {
  if (!success) {
    return {
      name: null,
      code: null,
    };
  }
  const medicationRequest = getResourcesOfType(
    cancelResponse,
    "MedicationRequest"
  )[0];
  const practitionerRoleReference = medicationRequest.requester.reference;
  const practitionerRoleEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerRoleReference
  )[0];
  const practitionerRole = practitionerRoleEntry.resource;
  const practitionerRoleSdsRole = practitionerRole.code
    .flatMap((code) => code.coding)
    .filter(
      (coding) =>
        coding.system ===
        "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName"
    )[0];
  const practitionerReference = practitionerRole.practitioner.reference;
  const practitionerEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerReference
  )[0];
  const practitioner = practitionerEntry.resource;
  const practitionerName = practitioner.name[0];
  return {
    name: `${practitionerName.prefix[0]} ${practitionerName.given[0]} ${practitionerName.family}`,
    code: practitionerRoleSdsRole.code,
  };
}

function getCanceller(cancelResponse, success) {
  if (!success) {
    return {
      name: null,
      code: null,
    };
  }

  const medicationRequest = getResourcesOfType(
    cancelResponse,
    "MedicationRequest"
  )[0];
  const practitionerRoleReferenceExtension = medicationRequest.extension.filter(
    (e) =>
      e.url ===
      "https://fhir.nhs.uk/StructureDefinition/Extension-DM-ResponsiblePractitioner"
  );
  if (!practitionerRoleReferenceExtension) {
    return getPrescriber(cancelResponse);
  }
  const practitionerRoleReference =
    practitionerRoleReferenceExtension[0].valueReference.reference;
  const practitionerRoleEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerRoleReference
  )[0];
  const practitionerRole = practitionerRoleEntry.resource;
  const practitionerRoleSdsRole = practitionerRole.code
    .flatMap((code) => code.coding)
    .filter(
      (coding) =>
        coding.system ===
        "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName"
    )[0];
  const practitionerReference = practitionerRole.practitioner.reference;
  const practitionerEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerReference
  )[0];
  const practitioner = practitionerEntry.resource;
  const practitionerName = practitioner.name[0];
  return {
    name: `${practitionerName.prefix[0]} ${practitionerName.given[0]} ${practitionerName.family}`,
    code: practitionerRoleSdsRole.code,
  };
}

function updateBundleIds(bundle) {
  const firstGroupIdentifier = getMedicationRequests(bundle)[0].groupIdentifier;

  const newBundleIdentifier = uuidv4();

  const originalShortFormId = firstGroupIdentifier.value;
  var newShortFormId = generateShortFormId(originalShortFormId);
  // + character reeks havoc on sqlalcamy postgress
  while (newShortFormId.includes("+")) {
    newShortFormId = generateShortFormId(originalShortFormId);
  }
  const newLongFormId = uuidv4();

  setPrescriptionIds(
    bundle,
    newBundleIdentifier,
    newShortFormId,
    newLongFormId
  );
}

function updateNominatedPharmacy(bundle, odsCode) {
  if (!odsCode) {
    return;
  }
  getMessageHeaders(bundle).forEach(function (messageHeader) {
    messageHeader.destination.forEach(function (destination) {
      destination.receiver.identifier.value = odsCode;
    });
  });
  getMedicationRequests(bundle).forEach(function (medicationRequest) {
    medicationRequest.dispenseRequest.performer.identifier.value = odsCode;
  });
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateShortFormId(originalShortFormId) {
  const _PRESC_CHECKDIGIT_VALUES = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+";
  const hexString = uuidv4().replace(/-/g, "").toUpperCase();
  let prescriptionID =
    hexString.substring(0, 6) +
    "-" +
    originalShortFormId.substring(7, 13) +
    "-" +
    hexString.substring(12, 17);
  const prscID = prescriptionID.replace(/-/g, "");
  const prscIDLength = prscID.length;
  let runningTotal = 0;
  let checkValue;
  const strings = prscID.split("");
  strings.forEach(function (character, index) {
    // IE compatibility cannot use **, have to use Math.pow
    runningTotal =
      runningTotal +
      parseInt(character, 36) * Math.pow(2, prscIDLength - index);
  });
  checkValue = (38 - (runningTotal % 37)) % 37;
  checkValue = _PRESC_CHECKDIGIT_VALUES.substring(checkValue, checkValue + 1);
  prescriptionID += checkValue;
  return prescriptionID;
}

function setPrescriptionIds(
  bundle,
  newBundleIdentifier,
  newShortFormId,
  newLongFormId
) {
  bundle.identifier.value = newBundleIdentifier;
  getMedicationRequests(bundle).forEach(function (medicationRequest) {
    const groupIdentifier = medicationRequest.groupIdentifier;
    groupIdentifier.value = newShortFormId;
    getLongFormIdExtension(
      groupIdentifier.extension
    ).valueIdentifier.value = newLongFormId;
  });
}

function getMessageHeaders(bundle) {
  return bundle.entry
    .map(function (entry) {
      return entry.resource;
    })
    .filter(function (resource) {
      return resource.resourceType === "MessageHeader";
    });
}

function getMedicationRequests(bundle) {
  return bundle.entry
    .map(function (entry) {
      return entry.resource;
    })
    .filter(function (resource) {
      return resource.resourceType === "MedicationRequest";
    });
}

function getLongFormIdExtension(extensions) {
  return extensions.filter(function (extension) {
    return (
      extension.url ===
      "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionId"
    );
  })[0];
}

window.onerror = function (msg, url, line, col, error) {
  // todo: fix cancellation page checkbox, prevent rivets from publishing checkbox values
  if (
    pageData.mode === "cancel" &&
    msg === "Uncaught TypeError: Cannot read property 'length' of undefined"
  ) {
    return true;
  }
  addError(
    "Unhandled error: " + msg + " at " + url + ":" + line + " col " + col
  );
  return true;
};

function addError(message) {
  if (pageData.errorList === undefined || pageData.errorList === null) {
    pageData.errorList = [];
  }
  pageData.errorList.push({
    message: message,
  });
}

function getSummary(payload) {
  const patient = getResourcesOfType(payload, "Patient")[0];
  const practitioner = getResourcesOfType(payload, "Practitioner")[0];
  const encounter = getResourcesOfType(payload, "Encounter")[0];
  const organizations = getResourcesOfType(payload, "Organization");
  const prescribingOrganization = organizations[0]; // todo: add logic to handle primary/secondary-care
  const parentOrganization = organizations[0];
  const medicationRequests = getResourcesOfType(payload, "MedicationRequest");

  const communicationRequests = getResourcesOfType(
    payload,
    "CommunicationRequest"
  );
  const patientInstructions = communicationRequests
    .flatMap((communicationRequest) => communicationRequest.payload)
    .filter(Boolean)
    .filter((payload) => payload.contentString)
    .map((payload) => payload.contentString)
    .join("\n");

  const startDate =
    medicationRequests[0].dispenseRequest.validityPeriod?.start ??
    new Date().toISOString().slice(0, 10);
  const medicationRepeatInformation = medicationRequests[0].extension.filter(
    (e) =>
      e.url ===
      "https://fhir.hl7.org.uk/StructureDefinition/Extension-UKCore-MedicationRepeatInformation"
  );
  const numberOfRepeatPrescriptionsIssuedExtension = medicationRepeatInformation.length
    ? medicationRepeatInformation[0].extension.filter(
        (e) => e.url === "numberOfRepeatPrescriptionsIssued"
      )
    : null;
  const numberOfRepeatPrescriptionsIssued =
    medicationRepeatInformation.length &&
    !numberOfRepeatPrescriptionsIssuedExtension.length
      ? 0
      : medicationRepeatInformation.length
      ? numberOfRepeatPrescriptionsIssuedExtension[0].valueUnsignedInt
      : null;
  return {
    id: medicationRequests[0].groupIdentifier.value,
    author: {
      startDate: startDate,
    },
    patientInstructions: patientInstructions,
    repeatNumber: Number.isInteger(numberOfRepeatPrescriptionsIssued)
      ? numberOfRepeatPrescriptionsIssued + 1
      : null,
    patient: patient,
    practitioner: practitioner,
    encounter: encounter,
    prescribingOrganization: prescribingOrganization,
    parentOrganization: parentOrganization,
    medicationRequests: medicationRequests,
  };
}

function getPayloads() {
  const isCustom = pageData.selectedExampleId == "custom";
  const filePayloads = pageData.payloads;
  const textPayloads = [document.getElementById("prescription-textarea").value];
  const payloads = filePayloads
    .concat(textPayloads)
    .filter(Boolean)
    .map((payload) => JSON.parse(payload));
  if (isCustom && !payloads.length) {
    addError("Unable to parse custom prescription(s)");
  } else {
    return isCustom
      ? payloads
      : [
          pageData.examples.filter(function (example) {
            return example.id === pageData.selectedExampleId;
          })[0].message,
        ];
  }
}

function getOdsCode() {
  const isCustom = pageData.selectedPharmacy == "custom";
  const customOdsCode = document.getElementById("pharmacy-input").value;
  if (isCustom && !customOdsCode) {
    addError("Unable to read custom ods code");
  }
  return isCustom ? customOdsCode : pageData.selectedPharmacy;
}

function getResourcesOfType(prescriptionBundle, resourceType) {
  const resources = prescriptionBundle.entry.map(function (entry) {
    return entry.resource;
  });
  return resources.filter(function (resource) {
    return resource.resourceType === resourceType;
  });
}

var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });

      let patients = [];
      workbook.SheetNames.forEach(function (sheetName) {
        var rows = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );

        switch (sheetName.toLowerCase()) {
          case "patients":
            patients = createPatients(rows);
            break;
          case "prescriptions":
            createPrescriptions(patients, rows);
            break;
        }
      });
    };

    reader.onerror = function (ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  var files = evt.target.files;
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function createPatients(rows) {
  return rows.map((row) => {
    return {
      fullUrl: "urn:uuid:78d3c2eb-009e-4ec8-a358-b042954aa9b2",
      resource: {
        resourceType: "Patient",
        identifier: [
          {
            extension: [
              {
                url:
                  "https://fhir.hl7.org.uk/StructureDefinition/Extension-UKCore-NHSNumberVerificationStatus",
                valueCodeableConcept: {
                  coding: [
                    {
                      system:
                        "https://fhir.hl7.org.uk/CodeSystem/UKCore-NHSNumberVerificationStatus",
                      code: "01",
                      display: "Number present and verified",
                    },
                  ],
                },
              },
            ],
            system: "https://fhir.nhs.uk/Id/nhs-number",
            value: row["NHS_NUMBER"],
          },
        ],
        name: [
          {
            use: "usual",
            family: row["FAMILY_NAME"],
            given: [
              //row["OTHER_GIVEN_NAME"], - todo, null handling
              row["GIVEN_NAME"],
            ],
            prefix: [row["TITLE"]],
          },
        ],
        gender: row["GENDER"].toLowerCase(),
        birthDate: `${row["DATE_OF_BIRTH"].substring(0, 4)}-${row[
          "DATE_OF_BIRTH"
        ].substring(4, 6)}-${row["DATE_OF_BIRTH"].substring(6)}`,
        address: [
          {
            use: "home",
            line: [
              //row["ADDRESS_LINE_1"], todo null handling
              row["ADDRESS_LINE_2"],
              //row["ADDRESS_LINE_3"],
              row["ADDRESS_LINE_4"],
              //row["ADDRESS_LINE_5"]
            ],
            postalCode: row["POST_CODE"],
          },
        ],
        generalPractitioner: [
          {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "A83008",
            },
          },
        ],
      },
    };
  });
}

function createPrescriptions(patients, rows) {
  pageData.payloads = [];
  const prescriptionRows = groupBy(rows, (row) => row["Test"]);
  prescriptionRows.forEach((prescriptionRows) => {
    const prescription = prescriptionRows[0];

    if (
      getPrescriptionTypeCode(prescription) === "continuous-repeat-dispensing"
    ) {
      const repeatsAllowed = getNumberOfRepeatsAllowed(prescription);
      for (
        let repeatsIssued = 0;
        repeatsIssued < repeatsAllowed;
        repeatsIssued++
      ) {
        pageData.payloads.push(
          createPrescription(
            patients,
            prescriptionRows,
            repeatsIssued,
            repeatsAllowed
          )
        );
      }
    } else {
      pageData.payloads.push(createPrescription(patients, prescriptionRows));
    }
  });
}

function createRepeatDispensingExtensionIfRequired(
  repeatsIssued,
  maxRepeatsAllowed
) {
  const extension = [
    {
      url: "numberOfRepeatPrescriptionsAllowed",
      valueUnsignedInt: maxRepeatsAllowed,
    },
    {
      url: "authorisationExpiryDate",
      valueDateTime: new Date("2025", "01", "01").toISOString().slice(0, 10), // todo: work this out from "days treatment"
    },
  ];

  if (repeatsIssued > 0) {
    extension.push({
      url: "numberOfRepeatPrescriptionsIssued",
      valueUnsignedInt: repeatsIssued,
    });
  }
  return {
    url:
      "https://fhir.hl7.org.uk/StructureDefinition/Extension-UKCore-MedicationRepeatInformation",
    extension: extension,
  };
}

function getMedicationQuantity(row) {
  return {
    value: row["Qty"],
    unit: row["UoM"],
    system: "http://snomed.info/sct",
    code: getMedicationQuantityCode(row["UoM"]),
  };
}

// todo: move this code to new column in test-pack or can we do snomed lookups?
function getMedicationQuantityCode(unitsOfMeasure) {
  switch (unitsOfMeasure) {
    case "ampoule":
      return "413516001";
    case "capsule":
      return "428641000";
    case "cartridge":
      return "732988008";
    case "dose":
      return "3317411000001100";
    case "enema":
      return "700476008";
    case "patch":
      return "419702001";
    case "plaster":
      return "733010002";
    case "pre-filled disposable injection":
      return "3318611000001103";
    case "sachet":
      return "733013000";
    case "tablet":
      return "428673006";
    case "vial":
      return "415818006";
    case "device":
    default:
      return "999999999";
  }
}

function getPatient(patients, prescriptionRows) {
  const prescription = prescriptionRows[0];
  const testNumber = prescription["Test"];
  return patients[testNumber - 1];
}

function createPrescription(
  patients,
  prescriptionRows,
  repeatsIssued = 0,
  maxRepeatsAllowed = 0
) {
  const careSetting = getCareSetting(prescriptionRows);

  const fhirPatient = getPatient(patients, prescriptionRows);

  const fhirPractitionerRole = {
    fullUrl: "urn:uuid:56166769-c1c4-4d07-afa8-132b5dfca666",
    resource: {
      resourceType: "PractitionerRole",
      id: "56166769-c1c4-4d07-afa8-132b5dfca666",
      identifier: [
        {
          system: "https://fhir.nhs.uk/Id/sds-role-profile-id",
          value: "100102238986",
        },
      ],
      practitioner: {
        reference: "urn:uuid:a8c85454-f8cb-498d-9629-78e2cb5fa47a",
      },
      organization: {
        reference: "urn:uuid:3b4b03a5-52ba-4ba6-9b82-70350aa109d8",
      },
      code: [
        {
          coding: [
            {
              system:
                "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName",
              code: "R8000", // todo: remove hardcoding?
              display: "Clinical Practitioner Access Role",
            },
          ],
        },
      ],
      telecom: [
        {
          system: "phone",
          value: "01234567890",
          use: "work",
        },
      ],
    },
  };

  if (careSetting === "Secondary-Care") {
    fhirPractitionerRole.resource.healthcareService = [
      {
        reference: "urn:uuid:54b0506d-49af-4245-9d40-d7d64902055e",
      },
    ];
  }

  const fhirPrescription = {
    resourceType: "Bundle",
    id: "aef77afb-7e3c-427a-8657-2c427f71a272",
    identifier: {
      system: "https://tools.ietf.org/html/rfc4122",
      value: "ea66ee9d-a981-432f-8c27-6907cbd99219",
    },
    type: "message",
    entry: [
      {
        fullUrl: "urn:uuid:aef77afb-7e3c-427a-8657-2c427f71a272",
        resource: {
          resourceType: "MessageHeader",
          id: "3599c0e9-9292-413e-9270-9a1ef1ead99c",
          eventCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/message-event",
            code: "prescription-order",
            display: "Prescription Order",
          },
          sender: {
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "RBA",
            },
            reference: "urn:uuid:56166769-c1c4-4d07-afa8-132b5dfca666",
            display: "RAZIA|ALI",
          },
          source: {
            endpoint: "urn:nhs-uk:addressing:ods:RBA",
          },
          destination: [
            {
              endpoint: `https://${
                pageData.environment === "int" ? "int." : ""
              }api.service.nhs.uk/electronic-prescriptions/$post-message`,
              receiver: {
                identifier: {
                  system: "https://fhir.nhs.uk/Id/ods-organization-code",
                  value: "X26",
                },
              },
            },
          ],
          focus: [],
        },
      },
      fhirPatient,
      fhirPractitionerRole,
      {
        fullUrl: "urn:uuid:a8c85454-f8cb-498d-9629-78e2cb5fa47a",
        resource: {
          resourceType: "Practitioner",
          id: "a8c85454-f8cb-498d-9629-78e2cb5fa47a",
          identifier: [
            {
              system: "https://fhir.nhs.uk/Id/sds-user-id",
              value: "7020134158",
            },
            {
              system: "https://fhir.hl7.org.uk/Id/gmc-number",
              value: "G9999999",
            },
            {
              system: "https://fhir.hl7.org.uk/Id/din-number",
              value: "70201123456",
            },
          ],
          name: [
            {
              family: "Edwards",
              given: ["Thomas"],
              prefix: ["DR"],
            },
          ],
        },
      },
      {
        fullUrl: "urn:uuid:51793ac0-112f-46c7-a891-9af8cefb206e",
        resource: {
          resourceType: "CommunicationRequest",
          status: "unknown",
          subject: {
            reference: "urn:uuid:78d3c2eb-009e-4ec8-a358-b042954aa9b2",
          },
          payload: [
            {
              contentString: "TEST PRESCRIPTION - DO NOT DISPENSE",
            },
          ],
          requester: {
            type: "Organization",
            identifier: {
              system: "https://fhir.nhs.uk/Id/ods-organization-code",
              value: "RBA", // todo: remove hardcoded
            },
          },
          recipient: [
            {
              type: "Patient",
              identifier: {
                system: "https://fhir.nhs.uk/Id/nhs-number",
                value: getNhsNumber(fhirPatient),
              },
            },
          ],
        },
      },
    ],
  };
  createMedicationRequests(
    prescriptionRows,
    repeatsIssued,
    maxRepeatsAllowed
  ).forEach((medicationRequest) =>
    fhirPrescription.entry.push(medicationRequest)
  );
  createPlaceResources(careSetting, fhirPrescription);
  return JSON.stringify(fhirPrescription);
}

function getCareSetting(prescriptionRows) {
  const row = prescriptionRows[0];
  const prescriberTypeCode = row["Prescriber  Code"];
  switch (prescriberTypeCode) {
    // https://simplifier.net/guide/DigitalMedicines/DM-Prescription-Type
    case "0108":
    case "0101":
    case "0113":
    case "0125":
    case "0105":
    case "0113":
      return "Primary-Care";
    case "1004":
    case "1001":
      return "Secondary-Care";
  }
}

function createPlaceResources(careSetting, fhirPrescription) {
  if (careSetting === "Primary-Care") {
    fhirPrescription.entry.push({
      fullUrl: "urn:uuid:3b4b03a5-52ba-4ba6-9b82-70350aa109d8",
      resource: {
        resourceType: "Organization",
        identifier: [
          {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "A83008",
          },
        ],
        type: [
          {
            coding: [
              {
                system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
                code: "76",
                display: "GP PRACTICE",
              },
            ],
          },
        ],
        name: "HALLGARTH SURGERY",
        address: [
          {
            use: "work",
            type: "both",
            line: ["HALLGARTH SURGERY", "CHEAPSIDE"],
            city: "SHILDON",
            district: "COUNTY DURHAM",
            postalCode: "DL4 2HP",
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "0115 9737320",
            use: "work",
          },
        ],
        partOf: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "84H",
          },
          display: "NHS COUNTY DURHAM CCG",
        },
      },
    });
  } else if (careSetting === "Secondary-Care") {
    fhirPrescription.entry.push({
      fullUrl: "urn:uuid:3b4b03a5-52ba-4ba6-9b82-70350aa109d8",
      resource: {
        resourceType: "Organization",
        id: "3b4b03a5-52ba-4ba6-9b82-70350aa109d8",
        identifier: [
          {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "RBA",
          },
        ],
        type: [
          {
            coding: [
              {
                system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
                code: "197",
                display: "NHS TRUST",
              },
            ],
          },
        ],
        name: "TAUNTON AND SOMERSET NHS FOUNDATION TRUST",
        address: [
          {
            line: ["MUSGROVE PARK HOSPITAL", "PARKFIELD DRIVE", "TAUNTON"],
            postalCode: "TA1 5DA",
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "01823333444",
            use: "work",
          },
        ],
      },
    });
    fhirPrescription.entry.push({
      fullUrl: "urn:uuid:54b0506d-49af-4245-9d40-d7d64902055e",
      resource: {
        resourceType: "HealthcareService",
        id: "54b0506d-49af-4245-9d40-d7d64902055e",
        identifier: [
          {
            use: "usual",
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "A99968",
          },
        ],
        active: true,
        providedBy: {
          identifier: {
            system: "https://fhir.nhs.uk/Id/ods-organization-code",
            value: "RBA",
          },
        },
        location: [
          {
            reference: "urn:uuid:8a5d7d67-64fb-44ec-9802-2dc214bb3dcb",
          },
        ],
        name: "SOMERSET BOWEL CANCER SCREENING CENTRE",
        telecom: [
          {
            system: "phone",
            value: "01823 333444",
            use: "work",
          },
        ],
      },
    });
    fhirPrescription.entry.push({
      fullUrl: "urn:uuid:8a5d7d67-64fb-44ec-9802-2dc214bb3dcb",
      resource: {
        resourceType: "Location",
        id: "8a5d7d67-64fb-44ec-9802-2dc214bb3dcb",
        identifier: [
          {
            value: "10008800708",
          },
        ],
        status: "active",
        mode: "instance",
        address: {
          use: "work",
          line: ["MUSGROVE PARK HOSPITAL"],
          city: "TAUNTON",
          postalCode: "TA1 5DA",
        },
      },
    });
  }
}

function createMedicationRequests(
  xlsxRowGroup,
  repeatsIssued,
  maxRepeatsAllowed
) {
  return xlsxRowGroup.map((row) => {
    const id = uuidv4();
    return {
      fullUrl: `urn:uuid:${id}`,
      resource: {
        resourceType: "MedicationRequest",
        id: id,
        extension: getMedicationRequestExtensions(
          row,
          repeatsIssued,
          maxRepeatsAllowed
        ),
        identifier: [
          {
            system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
            value: id,
          },
        ],
        status: "active",
        intent: "order",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
                code: "outpatient",
                display: "Outpatient",
              },
            ],
          },
        ],
        medicationCodeableConcept: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: getMedicationSnomedCode(row),
              display: getMedicationDisplay(row),
            },
          ],
        },
        subject: {
          reference: "urn:uuid:78d3c2eb-009e-4ec8-a358-b042954aa9b2",
        },
        authoredOn: "2021-05-07T14:47:29+00:00",
        requester: {
          reference: "urn:uuid:56166769-c1c4-4d07-afa8-132b5dfca666",
        },
        groupIdentifier: {
          extension: [
            {
              url:
                "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionId",
              valueIdentifier: {
                system: "https://fhir.nhs.uk/Id/prescription",
                value: "a5b9dc81-ccf4-4dab-b887-3d88e557febb",
              },
            },
          ],
          system: "https://fhir.nhs.uk/Id/prescription-order-number",
          value: "A0548B-A99968-451485",
        },
        courseOfTherapyType: {
          coding: [
            createPrescriptionType(
              getPrescriptionTypeSystem(row),
              getPrescriptionTypeCode(row)
            ),
          ],
        },
        dosageInstruction: [
          {
            text: getDosageInstructionText(row),
          },
        ],
        dispenseRequest: getDispenseRequest(row),
        substitution: {
          allowedBoolean: false,
        },
      },
    };
  });
}

function getDispenseRequest(row) {
  if (getPrescriptionTypeCode(row) === "continuous-repeat-dispensing") {
    return {
      extension: [
        {
          url:
            "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
            code: "P1",
          },
        },
      ],
      performer: {
        identifier: {
          system: "https://fhir.nhs.uk/Id/ods-organization-code",
          value: "VNCEL",
        },
      },
      quantity: getMedicationQuantity(row),
      validityPeriod: {
        start: "2021-05-07",
        end: "2021-07-04",
      },
      expectedSupplyDuration: {
        value: 30,
        unit: "day",
        system: "http://unitsofmeasure.org",
        code: "d",
      },
    };
  }

  return {
    extension: [
      {
        url:
          "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
          code: "P1",
        },
      },
    ],
    performer: {
      identifier: {
        system: "https://fhir.nhs.uk/Id/ods-organization-code",
        value: "VNCEL",
      },
    },
    quantity: getMedicationQuantity(row),
  };
}

function getDosageInstructionText(row) {
  return row["Dosage Instructions"]
    ? row["Dosage Instructions"]
    : "As directed";
}

function getMedicationSnomedCode(row) {
  return row["Snomed"].trim();
}

function getMedicationDisplay(row) {
  return row["Medication"];
}

function getMedicationRequestExtensions(row, repeatsIssued, maxRepeatsAllowed) {
  const prescriberTypeCode = row["Prescriber  Code"];
  const prescriberTypeDisplay = row["Prescriber Description"];
  const extension = [
    {
      url:
        "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
      valueCoding: {
        system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
        code: prescriberTypeCode,
        display: prescriberTypeDisplay,
      },
    },
  ];

  if (maxRepeatsAllowed) {
    extension.push(
      createRepeatDispensingExtensionIfRequired(
        repeatsIssued,
        maxRepeatsAllowed
      )
    );
  }

  row["Instructions for Prescribing"]?.split(", ").forEach((endorsement) =>
    extension.push({
      url:
        "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionEndorsement",
      valueCodeableConcept: {
        coding: [
          {
            system:
              "https://fhir.nhs.uk/CodeSystem/medicationrequest-endorsement",
            code: endorsement,
          },
        ],
      },
    })
  );

  return extension;
}

function getNhsNumber(fhirPatient) {
  return fhirPatient.resource.identifier.filter(
    (i) => i.system === "https://fhir.nhs.uk/Id/nhs-number"
  )[0].value;
}

function getPrescriptionTypeCode(row) {
  const firstPart = row["Prescription Type"].split(" ")[0];
  if (firstPart === "acute") return "acute";
  else {
    return "continuous-repeat-dispensing";
  }
}

function getPrescriptionTypeSystem(row) {
  const firstPart = row["Prescription Type"].split(" ")[0];
  if (firstPart === "acute")
    return "http://terminology.hl7.org/CodeSystem/medicationrequest-course-of-therapy";
  else {
    return "https://fhir.nhs.uk/CodeSystem/medicationrequest-course-of-therapy";
  }
}

function getNumberOfRepeatsAllowed(row) {
  return parseInt(row["Prescription Type"].split(" ")[0]);
}

function createPrescriptionType(system, code) {
  return {
    system,
    code,
  };
}

function doPrescriptionAction(select) {
  const value = select.value;
  const prescriptionId = Cookies.get("Current-Prescription-Id");
  switch (value) {
    case "cancel":
      window.open(
        `/prescribe/cancel?prescription_id=${prescriptionId}`,
        "_blank"
      );
      break;
    case "release":
      window.open(
        `/dispense/release?prescription_id=${prescriptionId}`,
        "_blank"
      );
      break;
    case "dispense":
      window.open(
        `/dispense/dispense?prescription_id=${prescriptionId}`,
        "_blank"
      );
      break;
    default:
      return;
  }
}

function createCancellation(bundle) {
  // Fixes duplicate hl7v3 identifier error
  // this is not an obvious error for a supplier to resolve as
  // there is no mention of the fhir field it relates to
  // can we improve our returned error message here??
  bundle.identifier.value = uuidv4();
  // ****************************************

  const messageHeader = getResourcesOfType(bundle, "MessageHeader")[0];
  messageHeader.eventCoding.code = "prescription-order-update";
  messageHeader.eventCoding.display = "Prescription Order Update";

  // remove focus references as references not in bundle causes validation errors
  // but no references always passes
  messageHeader.focus = [];
  // ****************************************

  var medicationToCancelSnomed = document.querySelectorAll(
    'input[name="cancel-medications"]:checked'
  )[0].value;
  const medicationRequestEntries = bundle.entry.filter(
    (entry) => entry.resource.resourceType === "MedicationRequest"
  );

  const medicationEntryToCancel = medicationRequestEntries.filter((e) =>
    e.resource.medicationCodeableConcept.coding.some(
      (c) => c.code === medicationToCancelSnomed
    )
  )[0];

  const clonedMedicationRequestEntry = JSON.parse(
    JSON.stringify(medicationEntryToCancel)
  );
  const medicationRequest = clonedMedicationRequestEntry.resource;
  medicationRequest.status = "cancelled";
  const cancellationReason = pageData.reasons.filter(
    (r) => r.id === pageData.selectedCancellationReasonId
  )[0];
  medicationRequest.statusReason = {
    coding: [
      {
        system:
          "https://fhir.nhs.uk/CodeSystem/medicationrequest-status-reason",
        code: cancellationReason.id,
        display: cancellationReason.display,
      },
    ],
  };
  bundle.entry = bundle.entry.filter(
    (entry) => entry.resource.resourceType !== "MedicationRequest"
  );
  bundle.entry.push(clonedMedicationRequestEntry);

  const canceller = pageData.cancellers.filter(
    (canceller) => canceller.id === pageData.selectedCancellerId
  )[0];

  if (canceller.id !== "same-as-original-author") {
    const cancelPractitionerRoleIdentifier = uuidv4();
    const cancelPractitionerIdentifier = uuidv4();

    medicationRequest.extension.push({
      url:
        "https://fhir.nhs.uk/StructureDefinition/Extension-DM-ResponsiblePractitioner",
      valueReference: {
        reference: `urn:uuid:${cancelPractitionerRoleIdentifier}`,
      },
    });

    const practitionerRoleEntry = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "PractitionerRole"
    )[0];
    const cancelPractitionerRoleEntry = JSON.parse(
      JSON.stringify(practitionerRoleEntry)
    );

    cancelPractitionerRoleEntry.fullUrl = `urn:uuid:${cancelPractitionerRoleIdentifier}`;
    const cancelPractitionerRole = cancelPractitionerRoleEntry.resource;
    cancelPractitionerRole.practitioner.reference = `urn:uuid:${cancelPractitionerIdentifier}`;
    cancelPractitionerRole.identifier = [
      {
        system: "https://fhir.nhs.uk/Id/sds-role-profile-id",
        value: canceller.sdsRoleProfileId,
      },
    ];
    cancelPractitionerRole.code.forEach((code) =>
      code.coding
        .filter(
          (coding) =>
            coding.system ===
            "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName"
        )
        .forEach((coding) => {
          (coding.code = canceller.id), (coding.display = canceller.display);
        })
    );
    bundle.entry.push(cancelPractitionerRoleEntry);

    const practitionerEntry = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "Practitioner"
    )[0];
    const cancelPractitionerEntry = JSON.parse(
      JSON.stringify(practitionerEntry)
    );
    cancelPractitionerEntry.fullUrl = `urn:uuid:${cancelPractitionerIdentifier}`;
    const cancelPractitioner = cancelPractitionerEntry.resource;
    cancelPractitioner.identifier = [
      {
        system: "https://fhir.nhs.uk/Id/sds-user-id",
        value: canceller.sdsUserId,
      },
      {
        system: canceller.professionalCodeSystem,
        value: canceller.professionalCodeValue,
      },
    ];
    cancelPractitioner.name = [
      {
        family: canceller.lastName,
        given: [canceller.firstName],
        prefix: [canceller.title],
      },
    ];
    bundle.entry.push(cancelPractitionerEntry);
  }

  return bundle;
}

function createDispenseRequest(bundle) {
  // Fixes duplicate hl7v3 identifier error
  // this is not an obvious error for a supplier to resolve as
  // there is no mention of the fhir field it relates to
  // can we improve our returned error message here??
  bundle.identifier.value = uuidv4();
  // ****************************************

  const messageHeader = getResourcesOfType(bundle, "MessageHeader")[0];
  messageHeader.eventCoding.code = "dispense-notification";
  messageHeader.eventCoding.display = "Dispense Notification";

  // remove focus references as references not in bundle causes validation errors
  // but no references always passes
  messageHeader.focus = [];
  // ****************************************

  const clonedHeaderEntry = JSON.parse(
    JSON.stringify(
      bundle.entry.filter((e) => e.resource.resourceType === "MessageHeader")[0]
    )
  );
  clonedHeaderEntry.resource.response = {
    identifier: "999f9999-9999-9999-9ff9-f9fff9999999",
    code: "ok",
  };

  var medicationToDispenseSnomed = document.querySelectorAll(
    'input[name="dispense-medications"]:checked'
  )[0].value;
  const medicationRequestEntries = bundle.entry.filter(
    (entry) => entry.resource.resourceType === "MedicationRequest"
  );

  const medicationRequestEntryToDispense = medicationRequestEntries.filter(
    (e) =>
      e.resource.medicationCodeableConcept.coding.some(
        (c) => c.code === medicationToDispenseSnomed
      )
  )[0];

  const clonedMedicationRequestEntry = JSON.parse(
    JSON.stringify(medicationRequestEntryToDispense)
  );
  const clonedMedicationRequest = clonedMedicationRequestEntry.resource;

  const medicationDispenseEntry = {};
  medicationDispenseEntry.fullUrl = clonedMedicationRequestEntry.fullUrl;
  medicationDispenseEntry.resource = {};
  const medicationDispense = medicationDispenseEntry.resource;
  medicationDispense.resourceType = "MedicationDispense";
  (medicationDispense.identifier = [
    {
      system: "https://fhir.nhs.uk/Id/prescription-dispense-item-number",
      value: clonedMedicationRequestEntry.fullUrl.replace("urn:uuid:", ""),
    },
  ]),
    (medicationDispense.extension = [
      {
        url:
          "https://fhir.nhs.uk/StructureDefinition/Extension-EPS-TaskBusinessStatus",
        valueCoding: {
          system: "https://fhir.nhs.uk/CodeSystem/EPS-task-business-status",
          code: "0003",
          display: "With Dispenser - Active",
        },
      },
    ]);
  medicationDispense.status = "completed";
  medicationDispense.medicationCodeableConcept =
    clonedMedicationRequest.medicationCodeableConcept;
  const patientEntry = bundle.entry.filter(
    (e) => e.resource.resourceType === "Patient"
  )[0];
  medicationDispense.subject = {
    type: "Patient",
    identifier: {
      system: "https://fhir.nhs.uk/Id/nhs-number",
      value: getNhsNumber(patientEntry),
    },
  };
  medicationDispense.authorizingPrescription = [
    {
      extension: [
        {
          url:
            "https://fhir.nhs.uk/StructureDefinition/Extension-DM-GroupIdentifier",
          extension: [
            {
              url: "shortForm",
              valueIdentifier: {
                system: "https://fhir.nhs.uk/Id/prescription-order-number",
                value: clonedMedicationRequest.groupIdentifier.value,
              },
            },
            {
              url: "UUID",
              valueIdentifier: {
                system: "https://fhir.nhs.uk/Id/prescription",
                value: getLongFormIdExtension(
                  clonedMedicationRequest.groupIdentifier.extension
                ).valueIdentifier.value,
              },
            },
          ],
        },
      ],
      identifier: {
        system: "https://fhir.nhs.uk/Id/prescription-order-item-number",
        value: clonedMedicationRequestEntry.fullUrl.replace("urn:uuid:", ""),
      },
    },
  ];
  medicationDispense.performer = [
    {
      actor: {
        type: "Practitioner",
        identifier: {
          system: "https://fhir.hl7.org.uk/Id/gphc-number",
          value: "7654321",
        },
        display: "Mr Peter Potion",
      },
    },
    {
      actor: {
        type: "Organization",
        identifier: {
          system: "https://fhir.nhs.uk/Id/ods-organization-code",
          value: "VNFKT",
        },
        display: "FIVE STAR HOMECARE LEEDS LTD",
      },
    },
  ];
  medicationDispense.type = {
    coding: [
      {
        system: "https://fhir.nhs.uk/CodeSystem/medicationdispense-type",
        code: "0003",
        display: "Item dispensed - partial",
      },
    ],
  };
  medicationDispense.whenPrepared = "2021-07-07T15:43:00+00:00";
  medicationDispense.dosageInstruction = [
    {
      text: "4 times a day for 7 days",
    },
  ];
  medicationDispense.quantity = clonedMedicationRequest.dispenseRequest?.quantity ?? undefined

  bundle.entry = bundle.entry
    .filter((entry) => entry.resource.resourceType !== "MessageHeader")
    .filter((entry) => entry.resource.resourceType !== "MedicationRequest")
    .filter((entry) => entry.resource.resourceType !== "Practitioner")
    .filter((entry) => entry.resource.resourceType !== "PractitionerRole")
    .filter((entry) => entry.resource.resourceType !== "CommunicationRequest")
    .filter((entry) => entry.resource.resourceType !== "Location")
    .filter((entry) => entry.resource.resourceType !== "Organization")
    .filter((entry) => entry.resource.resourceType !== "HealthcareService")
    .filter((entry) => entry.resource.resourceType !== "List");

  bundle.entry.unshift(clonedHeaderEntry);
  bundle.entry.push(medicationDispenseEntry);

  return bundle;
}

function onLoad() {
  if (pageData.mode === "release" && pageData.prescriptionId) {
    pageData.selectedReleaseId = "custom";
    resetPageData("release");
  }
  if (pageData.mode === "dispense") {
    const prescriptionId = Cookies.get("Current-Prescription-Id");
    const response = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    pageData.signRequestSummary = getSummary(response);
    resetPageData("dispense");
  }
  if (
    pageData.mode === "send" &&
    !pageData.sendResponse &&
    Cookies.get("Skip-Signature-Page") === "True"
  ) {
    sendPrescriptionRequest();
  }
  document
    .getElementById("prescription-test-pack")
    .addEventListener("change", handleFileSelect, false);
  if (pageData.mode === "cancel") {
    const prescriptionId = Cookies.get("Current-Prescription-Id");
    const response = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    pageData.signRequestSummary = getSummary(response);
    resetPageData("cancel");
  }
  bind();
  document.querySelector("#main-content").style.display = "";
}

// IE compat, no default values for function args
function resetPageData(pageMode) {
  pageData.mode = pageMode;
  pageData.errorList = null;
  pageData.sendResponse = null;
  pageData.signResponse = null;
  pageData.cancelResponse = null;
  pageData.showCustomExampleInput =
    pageMode === "load" ? pageData.selectedExampleId === "custom" : false;
  pageData.showCustomPharmacyInput =
    pageMode === "edit" || pageMode === "release"
      ? pageData.selectedPharmacy === "custom"
      : false;
  pageData.showCustomPrescriptionIdInput =
    pageMode === "release" ? pageData.selectedReleaseId === "custom" : false;
  pageData.releaseResponse = null;
  pageData.dispenseResponse = null;
  pageData.selectedPharmacy =
    pageMode === "edit" || pageMode === "release"
      ? pageData.selectedPharmacy ?? "VNFKT"
      : null;
  if (pageData.mode == "sign") {
    pageData.previous_prescription_id = Cookies.get("Previous-Prescription-Id");
    pageData.next_prescription_id = Cookies.get("Next-Prescription-Id");
  }
}

function bind() {
  rivets.bind(document.querySelector("#main-content"), pageData);
  document.getElementById("prescription-files").onchange = function (evt) {
    try {
      let files = evt.target.files;
      if (!files.length) {
        return;
      }
      for (var i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = (event) => {
          pageData.payloads.push(event.target.result);
        };
        reader.readAsText(files[i]);
      }
    } catch (err) {
      console.error(err);
    }
  };
}
