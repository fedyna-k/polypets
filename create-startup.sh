#!/bin/bash

cd ..


cat startup-first-half.sh | tee startup.sh
echo "${ENV_FILE}" | tee -a startup.sh
cat startup-second-half.sh | tee -a startup.sh

cd terraform