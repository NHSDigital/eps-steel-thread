const EXAMPLE_PRESCRIPTION = {
  "resourceType": "Bundle",
  "id": "7EB02341-5F62-4A76-2CD3-34F523452356",
  "type": "collection",
  "entry": [
    {
      "fullUrl": "urn:uuid:7B38DE32-877F-6D53-D27C-86E1BA35016C",
      "resource": {
        "resourceType": "MedicationRequest",
        "id": "7B38DE32-877F-6D53-D27C-86E1BA35016C",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "317896006",
              "display": "Digoxin 125 microgram oral tablet"
            }
          ]
        },
        "subject": {
          "reference": "urn:uuid:C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C"
        },
        "encounter": {
          "reference": "urn:uuid:401AEEE1-0E1B-42A0-989C-03DEA8667CB7"
        },
        "authoredOn": "2008-02-27T11:38:00+00:00",
        "requester": {
          "reference": "urn:uuid:1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D"
        },
        "dosageInstruction": [
          {
            "text": "1 tablet after breakfast"
          }
        ],
        "dispenseRequest": {
          "quantity": {
            "value": 28,
            "unit": "tablet",
            "system": "http://snomed.info/sct",
            "code": "3319411000001109"
          }
        }
      }
    },
    {
      "fullUrl": "urn:uuid:8D12DE62-826F-8D32-E17C-86D3BA56013E",
      "resource": {
        "resourceType": "MedicationRequest",
        "id": "8D12DE62-826F-8D32-E17C-86D3BA56013E",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "319775004",
              "display": "Aspirin 75 mg oral tablet"
            }
          ]
        },
        "subject": {
          "reference": "urn:uuid:C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C"
        },
        "encounter": {
          "reference": "urn:uuid:401AEEE1-0E1B-42A0-989C-03DEA8667CB7"
        },
        "authoredOn": "2008-02-27T11:38:00+00:00",
        "requester": {
          "reference": "urn:uuid:1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D"
        },
        "dosageInstruction": [
          {
            "text": "1 tablet during breakfast"
          }
        ],
        "dispenseRequest": {
          "quantity": {
            "value": 28,
            "unit": "tablet",
            "system": "http://snomed.info/sct",
            "code": "3319411000001109"
          }
        }
      }
    },
    {
      "fullUrl": "urn:uuid:9A12DE62-826F-8D32-E17C-86D3BA56023F",
      "resource": {
        "resourceType": "MedicationRequest",
        "id": "9A12DE62-826F-8D32-E17C-86D3BA56023F",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "377145005",
              "display": "Lorazepam 2 mg oral tablet"
            }
          ]
        },
        "subject": {
          "reference": "urn:uuid:C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C"
        },
        "encounter": {
          "reference": "urn:uuid:401AEEE1-0E1B-42A0-989C-03DEA8667CB7"
        },
        "authoredOn": "2008-02-27T11:38:00+00:00",
        "requester": {
          "reference": "urn:uuid:1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D"
        },
        "dosageInstruction": [
          {
            "text": "3 tablets before breakfast"
          }
        ],
        "dispenseRequest": {
          "quantity": {
            "value": 84,
            "unit": "tablet",
            "system": "http://snomed.info/sct",
            "code": "3319411000001109"
          }
        }
      }
    },
    {
      "fullUrl": "urn:uuid:2A32DE62-826F-8D32-E17C-86D3BA56013D",
      "resource": {
        "resourceType": "MedicationRequest",
        "id": "2A32DE62-826F-8D32-E17C-86D3BA56013D",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "421375004",
              "display": "Citalopram (as citalopram hydrobromide) 40 mg orodispersible tablet"
            }
          ]
        },
        "subject": {
          "reference": "urn:uuid:C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C"
        },
        "encounter": {
          "reference": "urn:uuid:401AEEE1-0E1B-42A0-989C-03DEA8667CB7"
        },
        "authoredOn": "2008-02-27T11:38:00+00:00",
        "requester": {
          "reference": "urn:uuid:1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D"
        },
        "dosageInstruction": [
          {
            "text": "2 tablets after breakfast"
          }
        ],
        "dispenseRequest": {
          "quantity": {
            "value": 56,
            "unit": "tablet",
            "system": "http://snomed.info/sct",
            "code": "3319411000001109"
          }
        }
      }
    },
    {
      "fullUrl": "urn:uuid:C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C",
      "resource": {
        "resourceType": "Patient",
        "id": "C6750CAA-3CA9-4F29-A282-6EE1AA5D7D4C",
        "identifier": [
          {
            "system": "https://fhir.nhs.uk/Id/nhs-number",
            "value": "9900008464"
          }
        ],
        "name": [
          {
            "use": "official",
            "family": "Anderson",
            "given": [
              "Michael",
              "Jack"
            ],
            "prefix": [
              "Mr"
            ]
          }
        ],
        "gender": "male",
        "birthDate": "1973-04-21",
        "address": [
          {
            "use": "home",
            "type": "both",
            "line": [
              "1 Otley Road,"
            ],
            "city": "Leeds",
            "postalCode": "LS6 5RU"
          }
        ]
      }
    },
    {
      "fullUrl": "urn:uuid:1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D",
      "resource": {
        "resourceType": "Practitioner",
        "id": "1557E58E-3B1E-41DD-B3B5-D4D393DC5A3D",
        "identifier": [
          {
            "system": "https://fhir.nhs.uk/Id/sds-user-id",
            "value": "125686540025"
          },
          {
            "system": "https://fhir.nhs.uk/Id/sds-job-role-id",
            "value": "R0260"
          },
          {
            "system": "https://fhir.nhs.uk/Id/sds-role-profile-id",
            "value": "934565838956"
          }
        ],
        "name": [
          {
            "use": "official",
            "family": "Hurst",
            "prefix": [
              "Dr"
            ]
          }
        ],
        "telecom": [
          {
            "system": "phone",
            "value": "tel:011327534256",
            "use": "work"
          }
        ]
      }
    },
    {
      "fullUrl": "urn:uuid:401AEEE1-0E1B-42A0-989C-03DEA8667CB7",
      "resource": {
        "resourceType": "Encounter",
        "id": "401AEEE1-0E1B-42A0-989C-03DEA8667CB7",
        "status": "finished",
        "class": {
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          "code": "AMB"
        },
        "serviceProvider": {
          "reference": "urn:uuid:6666C3B3-FDCD-41B8-9D69-AD1E6D99D9FC"
        }
      }
    },
    {
      "fullUrl": "urn:uuid:6666C3B3-FDCD-41B8-9D69-AD1E6D99D9FC",
      "resource": {
        "resourceType": "Organization",
        "id": "6666C3B3-FDCD-41B8-9D69-AD1E6D99D9FC",
        "identifier": [
          {
            "system": "https://fhir.nhs.uk/Id/ods-organization-code",
            "value": "M85011"
          }
        ],
        "type": [
          {
            "coding": [
              {
                "system": "urn:oid:2.16.840.1.113883.2.1.3.2.4.17.94",
                "code": "001",
                "display": "General Medical Practice"
              }
            ]
          }
        ],
        "name": "Signing_Surg_1",
        "telecom": [
          {
            "system": "phone",
            "value": "tel:01132754568",
            "use": "work"
          }
        ],
        "address": [
          {
            "use": "work",
            "line": [
              "1 Princes Street"
            ],
            "city": "Leeds",
            "postalCode": "LS1 5AH"
          }
        ],
        "partOf": {
          "reference": "urn:uuid:8DCB2153-09F5-4604-9229-A5C8C7195199"
        }
      }
    },
    {
      "fullUrl": "urn:uuid:8DCB2153-09F5-4604-9229-A5C8C7195199",
      "resource": {
        "resourceType": "Organization",
        "id": "8DCB2153-09F5-4604-9229-A5C8C7195199",
        "identifier": [
          {
            "system": "https://fhir.nhs.uk/Id/ods-organization-code",
            "value": "4CD"
          }
        ],
        "type": [
          {
            "coding": [
              {
                "system": "urn:oid:2.16.840.1.113883.2.1.3.2.4.17.94",
                "code": "005",
                "display": "Primary Care Trust"
              }
            ]
          }
        ],
        "name": "West Yorkshire"
      }
    }
  ]
}