
EOF

sudo systemctl kill coturn

sudo docker compose up --build -d  # Web server
sudo turnserver --log-file stdout -u polypets:polypets  # TURN server