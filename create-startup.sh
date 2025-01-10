#!/bin/bash

cd ..


cat startup-0.sh | tee startup.sh
echo "${ENV_FILE}" | tee -a startup.sh
cat startup-1.sh | tee -a startup.sh
echo "${CERTIFICATE_TLS}" | tee -a startup.sh
cat startup-2.sh | tee -a startup.sh
echo "${PRIVATE_KEY_TLS}" | tee -a startup.sh
cat startup-3.sh | tee -a startup.sh

cd terraform