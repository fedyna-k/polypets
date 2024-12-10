terraform {
  backend "gcs" {
    bucket = "terraform-state-polypets"
    prefix = "prod"
  }
}

provider "google" {
  project = "polypets"
  region  = var.subnet-region
  zone    = var.instance-region
}

output "server" {
  value = join("", ["https://", google_compute_instance.default.network_interface.0.access_config.0.nat_ip])
}