# Docker Hub node official image

# When building, the image first installs all dependencies.
# Then it compiles the typescript.
# Then the port is exposed and the microservice started.

FROM node:current-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY . .

RUN npm run build

COPY ${CERTIFICATE_BASE_PATH} ./certs/prd

EXPOSE 80
EXPOSE 443

CMD [ "npm", "start" ]