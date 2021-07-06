# Electronic Prescription Service Assurance Tool

This is a hosted site to assist with testing and tracking implemented features for the *Electronic Prescription Service FHIR® API*.

## Environments

The site is hosted in heroku and has a development and production version

| Environment      | Heroku App Name  | Url                                  |
| ---------------- | ---------------- | ------------------------------------ |
| Integration      | epsat-int        | https://nhsd-epsat-int.herokuapp.com |
| Production       | epsat            | https://nhsd-epsat.herokuapp.com     |


Smartcard auth is enabled by default, once logged in via smartcard you are able to change authentication to simulated.

## Backend

The assurance tool is configured against the EPS environments above so any created prescriptions will be created and persisted in the matching EPS environment

## Features

* Parse a FHIR prepare nominated-pharmacy prescription-order into a readable format
* Amend a prescription to be nominated to another pharmacy
* Sign a prescription
* Send a prescription
* Release prescriptions for a pharmacy
* Dispense a prescription
