#!/bin/bash

/usr/bin/logger "===== ENTERING STARTUP SCRIPT ====="

# Install docker and all dependencies
sudo apt update
sudo apt --force-yes install ca-certificates curl git apt-transport-artifact-registry coturn
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt --force-yes install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Check if git repo is already cloned
if [ ! -d "./polypets" ]; then
  git clone https://github.com/fedyna-k/polypets
fi

# Update git code base
cd polypets
git pull

# Update secrets
echo $ENV_FILE > .env

# Update certbot certificates
sudo docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            certbot/certbot certonly --standalone -d app.fedyna.fr --text --agree-tos --email fedyna.kevin@gmail.com --server https://acme-v02.api.letsencrypt.org/directory --rsa-key-size 4096 --verbose --keep-until-expiring --preferred-challenges=http

/usr/bin/logger "===== STARTING DOCKER COMPOSE ====="

sudo docker compose up --build -d  # Web server
turnserver --log-file stdout  # TURN server