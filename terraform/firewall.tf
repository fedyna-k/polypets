resource "google_compute_firewall" "https" {
  name = "allow-https"

  allow {
    ports    = ["80", "443"]
    protocol = "tcp"
  }

  direction     = "INGRESS"
  network       = google_compute_network.vpc_network.id
  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "turn" {
  name = "allow-turn"

  allow {
    ports    = ["3478", "5349"]
    protocol = "tcp"
  }

  allow {
    ports    = ["3478", "5349", "49152-65535"]
    protocol = "udp"
  }

  direction     = "INGRESS"
  network       = google_compute_network.vpc_network.id
  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "https-egress" {
  name = "allow-https-egress"

  allow {
    ports    = ["80", "443"]
    protocol = "tcp"
  }

  direction     = "EGRESS"
  network       = google_compute_network.vpc_network.id
  source_ranges = ["0.0.0.0/0"]
}


resource "google_compute_firewall" "ssh" {
  name = "allow-ssh"

  allow {
    ports    = ["22"]
    protocol = "tcp"
  }

  direction     = "INGRESS"
  network       = google_compute_network.vpc_network.id
  priority      = 1000
  source_ranges = ["0.0.0.0/0"]
}
