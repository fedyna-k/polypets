variable "instance-region" {
  type        = string
  default     = "us-east1-b"
  description = "The Instance region, us-east1 is recommanded as it is the nearest"

  validation {
    condition     = can(regex("^us-(east|west|central)1-b$", var.instance-region))
    error_message = "Subnet region must be in US1-b, may it be east central or west"
  }
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

  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.script.detect_md5hash
    ]
  }

  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-117-lts"
    }
  }

  metadata = {
    "startup-script-url" = join("/", [google_storage_bucket.script_bucket.url, google_storage_bucket_object.script.name])
  }

  network_interface {
    subnetwork = google_compute_subnetwork.default.id

    access_config {
      nat_ip                 = google_compute_address.static_ip.address
      public_ptr_domain_name = "app.fedyna.fr."
    }
  }
}
