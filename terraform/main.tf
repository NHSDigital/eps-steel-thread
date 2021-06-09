provider "apigee" {
  org          = var.apigee_organization
  access_token = var.apigee_token
}

terraform {
  backend "azurerm" {}

  required_providers {
    apigee = "~> 0.0"
    archive = "~> 1.3"
  }
}

module "eps-steel-thread" {
  source                   = "github.com/NHSDigital/api-platform-service-module"
  name                     = "eps-steel-thread"
  path                     = "eps-steel-thread"
  apigee_environment       = var.apigee_environment
  proxy_type               = (var.force_sandbox || length(regexall("sandbox", var.apigee_environment)) > 0) ? "sandbox" : "live"
  namespace                = var.namespace
  make_api_product         = !(length(var.namespace) > 0 || length(regexall("sandbox", var.apigee_environment)) > 0)
  api_product_display_name = "EPS Steel Thread"
  api_product_description  = ""
}
