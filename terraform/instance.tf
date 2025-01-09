variable "instance-region" {
  type        = string
  default     = "us-east1-b"
  description = "The Instance region, us-east1 is recommanded as it is the nearest"
}

resource "google_compute_address" "static_ip" {
  name         = "polypets-static-ip"
  region       = var.subnet-region
  address_type = "EXTERNAL"
}

resource "google_compute_instance" "default" {
  name                      = "polypets-vm"
  machine_type              = "e2-standard-16"
  zone                      = var.instance-region
  allow_stopping_for_update = true

  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.script.detect_md5hash,
      google_storage_bucket_object.script.metadata.version
    ]
  }

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
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

  service_account {
    email = "38428737821-compute@developer.gserviceaccount.com"
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
