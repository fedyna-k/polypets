variable "instance-region" {
  type        = string
  default     = "us-east1-b"
  description = "The Instance region, us-east1 is recommanded as it is the nearest"

  validation {
    condition     = can(regex("^us-(east|west|central)1-b$", var.instance-region))
    error_message = "Subnet region must be in US1-b, may it be east central or west"
  }
}

variable "ssh_key" {
  type = string
}

variable "gce_ssh_user" {
  type = string
}

resource "google_compute_address" "static_ip" {
  name         = "polypets-static-ip"
  region       = var.subnet-region
  address_type = "EXTERNAL"
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

  metadata = {
    "ssh-keys" = "${var.gce_ssh_user}:${var.ssh_key}"
  }

  metadata_startup_script = ""

  network_interface {
    subnetwork = google_compute_subnetwork.default.id

    access_config {
      nat_ip                 = google_compute_address.static_ip.address
      public_ptr_domain_name = "app.fedyna.fr."
    }
  }
}