variable "subnet-region" {
  type        = string
  default     = "us-east1"
  description = "The Subnet region, us-east1 is recommanded as it is the nearest"

  validation {
    condition     = can(regex("^us-(east|west|central)1$", var.subnet-region))
    error_message = "Subnet region must be in US1, may it be east central or west"
  }
}

resource "google_compute_network" "vpc_network" {
  name                    = "polypets-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
}

resource "google_compute_subnetwork" "default" {
  name          = "polypets-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.subnet-region
  network       = google_compute_network.vpc_network.id
}