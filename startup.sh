

# Check if git repo is already cloned
if [ ! -d "./polypets" ]; then
  git clone https://github.com/fedyna-k/polypets
fi

# Update git code base
cd polypets
git pull

# Update secrets
echo $ENV_FILE > .env

docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            certbot/certbot certonly --standalone -d app.fedyna.fr --text --agree-tos --email fedyna.kevin@gmail.com --server https://acme-v02.api.letsencrypt.org/directory --rsa-key-size 4096 --verbose --keep-until-expiring --preferred-challenges=http

docker compose up --build