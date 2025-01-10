
EOF

sudo systemctl kill coturn

sudo docker compose up --build -d  # Web server
sudo turnserver --log-file stdout -u polypets:polypets \
  --cert ./nginx/certs/dev/cert.pem \
  --pkey ./nginx/certs/dev/privkey.pem  # TURN server