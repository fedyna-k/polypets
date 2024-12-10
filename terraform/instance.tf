variable "instance-region" {
  type        = string
  default     = "us-east1-b"
  description = "The Instance region, us-east1 is recommanded as it is the nearest"

  validation {
    condition     = can(regex("^us-(east|west|central)1-b$", var.instance-region))
    error_message = "Subnet region must be in US1-b, may it be east central or west"
  }
}

resource "google_compute_instance" "default" {
  name         = "polypets-vm"
  machine_type = "e2-micro"
  zone         = var.instance-region

  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-117-lts"
    }
  }

  metadata_startup_script = ""

  network_interface {
    subnetwork = google_compute_subnetwork.default.id

    access_config {
      public_ptr_domain_name = "app.fedyna.fr."
    }
  }
}