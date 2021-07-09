/**
 * Models
 */
const epsModelsUrl =
  "https://raw.githubusercontent.com/NHSDigital/electronic-prescription-service-api/master/examples";

function getPrescription(path) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", epsModelsUrl + "/" + path, false);
  xmlHttp.send(null);
  const bundle = JSON.parse(xmlHttp.responseText);
  return bundle;
}

/**
 * Examples
 */
const PRIMARY_CARE_ACUTE_NOMINATED = getPrescription(
  "primary-care/acute/nominated-pharmacy/medical-prescriber/1-Prepare-Request-200_OK.json"
);
const PRIMARY_CARE_REPEAT_PRESCRIBING_NOMINATED = getPrescription(
  "primary-care/repeat-prescribing/1-Prepare-Request-200_OK.json"
);
const SECONDARY_CARE_COMMUNITY_ACUTE_NOMINATED = getPrescription(
  "secondary-care/community/acute/nominated-pharmacy/clinical-practitioner/1-Prepare-Request-200_OK.json"
);
const SECONDARY_CARE_REPEAT_DISPENSING_NOMINATED = getPrescription(
  "secondary-care/community/repeat-dispensing/nominated-pharmacy/clinical-practitioner/multiple-medication-requests/prescriber-endorsed/1-Prepare-Request-200_OK.json"
);
const SECONDARY_CARE_COMMUNITY_ACUTE_NON_NOMINATED = getPrescription(
  "secondary-care/community/acute/no-nominated-pharmacy/clinical-practitioner/1-Prepare-Request-200_OK.json"
);
const HOMECARE_ACUTE_NOMINATED = getPrescription(
  "secondary-care/homecare/acute/nominated-pharmacy/clinical-practitioner/1-Prepare-Request-200_OK.json"
);
export default {
  PRIMARY_CARE_ACUTE_NOMINATED,
  PRIMARY_CARE_REPEAT_PRESCRIBING_NOMINATED,
  SECONDARY_CARE_COMMUNITY_ACUTE_NOMINATED,
  SECONDARY_CARE_COMMUNITY_ACUTE_NON_NOMINATED,
  SECONDARY_CARE_REPEAT_DISPENSING_NOMINATED,
  HOMECARE_ACUTE_NOMINATED,
};
//let PRIMARY_CARE_REPEAT_DISPENSING_NOMINATED = getPrescription("primary-care/repeat-dispensing/nominated-pharmacy/medical-prescriber/author/gmc/responsible-party/medication-list/din/1-Prepare-Request-200_OK.json")
//let SECONDARY_CARE_REPEAT_PRESCRIBING_NOMINATED = getPrescription("todo")
//let HOMECARE_REPEAT_DISPENSING_NOMINATED = getPrescription("todo")
//let HOMECARE_REPEAT_PRESCRIBING_NOMINATED = getPrescription("todo")
