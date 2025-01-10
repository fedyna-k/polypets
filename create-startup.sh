cd ..
echo "${$(cat startup-template.sh)/::ENV::/${ENV_FILE}}" > startup.sh
cd terraform