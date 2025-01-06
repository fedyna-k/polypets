variable "bucket-location" {
  type        = string
  default     = "US"
  description = "The bucket location, must be US"

  validation {
    condition     = can(regex("^US$", var.bucket-location))
    error_message = "Bucket location must be US."
  }
}


resource "google_storage_bucket" "script_bucket" {
  name          = "polypets-startup-script-bucket"
  location      = var.bucket-location
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "script" {
  name           = "startup-script"
  source         = "../startup.sh"
  content_type   = "text/plain"
  detect_md5hash = base64encode(md5(file("../startup.sh")))

  metadata = {
    "version" = var.version
  }

  bucket = google_storage_bucket.script_bucket.id
}
