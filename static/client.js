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
    //new Prescription("5", "Secondary Care - Repeat Dispensing (nominated)", SECONDARY_CARE_REPEAT_DISPENSING_NOMINATED),
    //new Prescription("6", "Secondary Care - Repeat Prescribing (nominated)", SECONDARY_CARE_REPEAT_PRESCRIBING_NOMINATED),
    new Prescription(
      "7",
      "Homecare - Acute (nominated)",
      HOMECARE_ACUTE_NOMINATED
    ),
    //new Prescription("8", "Homecare - Repeat Dispensing (nominated)", HOMECARE_REPEAT_DISPENSING_NOMINATED),
    //new Prescription("9", "Homecare - Repeat Prescribing (nominated)", HOMECARE_REPEAT_PRESCRIBING_NOMINATED),
    new Prescription("custom", "Custom", null),
  ],
  pharmacies: [
    new Pharmacy("VNFKT", "FIVE STAR HOMECARE LEEDS LTD"),
    new Pharmacy("YGM1E", "MBBM HEALTHCARE TECHNOLOGIES LTD"),
    new Pharmacy("custom", "Custom", null),
  ],
  actions: [
    new PrescriptionAction("", ""),
    new PrescriptionAction("cancel", "Cancel"),
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
  mode: "home",
  signature: "",
  loggedIn: Cookies.get("Access-Token-Set") === "true",
  showCustomExampleInput: false,
  showCustomPharmacyInput: false,
  selectedExampleId: "1",
  selectedCancellationReasonId: "0001",
  selectedCancellerId: "same-as-original-author",
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
rivets.formatters.snomedCode = function (codings) {
  return codings
    ? codings.filter(function (coding) {
        return coding.system === "http://snomed.info/sct";
      })[0].code
    : "";
};

rivets.formatters.snomedCodeDescription = function (codings) {
  return codings
    ? codings.filter(function (coding) {
        return coding.system === "http://snomed.info/sct";
      })[0].display
    : "";
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
        .map((coding) => coding.display)
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
rivets.formatters.isReleaseNominatedPharmacy = function (mode) {
  return mode === "release-nominated-pharmacy";
};
rivets.formatters.showPharmacyList = function (mode) {
  return mode === "edit" || mode === "release-nominated-pharmacy";
};

rivets.formatters.joinWithSpaces = function (strings) {
  return strings.join(" ");
};

rivets.formatters.appendPageMode = function (string) {
  return string + pageData.mode;
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
    pageData.cancelResponse.prescriber = getPrescriber(parsedCancelResponse);
    pageData.cancelResponse.canceller = getCanceller(parsedCancelResponse);
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

function sendDispenseNominatedPharmacyReleaseRequest() {
  try {
    const request = {
      odsCode: getOdsCode(),
    };
    const response = makeRequest(
      "POST",
      "/dispense/release-nominated-pharmacy",
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
  } catch (e) {
    console.log(e);
    addError("Communication error");
  }
}

function getPrescriber(cancelResponse) {
  const medicationRequest = getResourcesOfType(
    cancelResponse,
    "MedicationRequest"
  )[0];
  const practitionerRoleReference = medicationRequest.requester.reference;
  const practitionerRoleEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerRoleReference
  )[0];
  const practitionerRole = practitionerRoleEntry.resource;
  const practitionerRoleSdsRole = practitionerRole
    .flatMap((r) => r.code)
    .map((code) => code.coding)
    .filter(
      (coding =
        coding.system ===
        "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName")
    )[0];
  const practitionerReference = practitionerRole.practitioner.reference;
  const practitionerEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerReference
  );
  const practitioner = practitionerEntry.resource;
  const practitionerName = practitioner.name[0];
  return {
    name: `${practitionerName.prefix[0]} ${practitionerName.given[0]} ${practitionerName.family}`,
    code: practitionerRoleSdsRole.code,
    role: practitionerRoleSdsRole.display ?? "???",
  };
}

function getCanceller(cancelResponse) {
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
  const practitionerRoleSdsRole = practitionerRole
    .flatMap((r) => r.code)
    .map((code) => code.coding)
    .filter(
      (coding =
        coding.system ===
        "https://fhir.hl7.org.uk/CodeSystem/UKCore-SDSJobRoleName")
    )[0];
  const practitionerReference = practitionerRole.practitioner.reference;
  const practitionerEntry = cancelResponse.entry.filter(
    (e) => e.fullUrl === practitionerReference
  );
  const practitioner = practitionerEntry.resource;
  const practitionerName = practitioner.name[0];
  return {
    name: `${practitionerName.prefix[0]} ${practitionerName.given[0]} ${practitionerName.family}`,
    code: practitionerRoleSdsRole.code,
    role: practitionerRoleSdsRole.display ?? "???",
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
  const startDate =
    medicationRequests[0].dispenseRequest.validityPeriod?.start ??
    new Date().toISOString().slice(0, 10);
  return {
    author: {
      startDate: startDate,
    },
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

function doPrescriptionAction(select) {
  const value = select.value;
  const prescriptionId = Cookies.get("Current-Prescription-Id");
  switch (value) {
    case "cancel":
      window.location.href = `/prescribe/cancel?prescription_id=${prescriptionId}`;
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

  // cheat and get first medicationrequest to cancel
  // todo: cancellations should be at medication level, not prescription level
  const messageHeader = getResourcesOfType(bundle, "MessageHeader")[0];
  messageHeader.eventCoding.code = "prescription-order-update";
  messageHeader.eventCoding.display = "Prescription Order Update";

  // cheat and remove focus references as references not in bundle causes validation errors
  // but no references always passes
  messageHeader.focus = [];
  // ****************************************

  const medicationRequestEntries = bundle.entry.filter(
    (entry) => entry.resource.resourceType === "MedicationRequest"
  );
  const clonedMedicationRequestEntry = JSON.parse(
    JSON.stringify(medicationRequestEntries[0])
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

function onLoad() {
  bind();
  if (
    pageData.mode === "send" &&
    !pageData.sendResponse &&
    Cookies.get("Skip-Signature-Page") === "True"
  ) {
    sendPrescriptionRequest();
  }
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
    pageMode === "edit" || pageMode === "release-nominated-pharmacy"
      ? pageData.selectedPharmacy === "custom"
      : false;
  pageData.releaseResponse = null;
  pageData.selectedPharmacy =
    pageMode === "edit" || pageMode === "release-nominated-pharmacy"
      ? pageData.selectedPharmacy ?? "VNFKT"
      : null;
  if (pageData.mode == "sign") {
    const prescriptionId = Cookies.get("Current-Prescription-Id");
    const response = makeRequest(
      "GET",
      `/prescribe/edit?prescription_id=${prescriptionId}`
    );
    pageData.signRequestSummary = getSummary(response);
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
