EOF

# Update certbot certificates
sudo docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            certbot/certbot certonly --standalone -d app.fedyna.fr --text --agree-tos --email fedyna.kevin@gmail.com --server https://acme-v02.api.letsencrypt.org/directory --rsa-key-size 4096 --verbose --keep-until-expiring --preferred-challenges=http

sudo cp /etc/letsencrypt/live/app.fedyna.fr/ ./nginx/certs/dev

sudo docker compose up --build -d  # Web server
sudo systemctl kill coturn
sudo turnserver --log-file stdout -u polypets:polypets  # TURN server