# Electronic Prescription Service Assurance Tool

This is a frontend site to assist with testing and tracking implemented features for the *Electronic Prescription Service FHIR® API*.

## Environments

The site is hosted in heroku and has a development and production version

| Environment      | Heroku App Name  | Url                                  | Version                                             |
| ---------------- | ---------------- | ------------------------------------ | --------------------------------------------------- |
| Development      | epsat-dev        | https://nhsd-epsat-dev.herokuapp.com | branch: migrate-to-eps-assurance-tool               |
| Production       | epsat            | https://nhsd-epsat.herokuapp.com     | commit-id: 16234ba571482a1718773299b5437a3f384d01e1 |


Smartcard auth is enabled by default so on hitting any of the above URLs you will be redirected to authenticate with a smartcard.

If you don't have a smartcard you can navigate to `/login` to select simulated auth instead

## Backend

The assurance tool is configured against the EPS Integration Environment so any created prescriptions will be created and persisted in the Integration enviroment

## Features

* Parse a FHIR prepare nominated-pharmacy prescription-order into a readable format
* Amend a prescription to be nominated to another pharmacy
* Sign a prescription
* Send a prescription
* Release prescriptions for a pharmacy