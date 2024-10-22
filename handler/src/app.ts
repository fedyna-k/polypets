import express from "express";
import https from "https";
import { readFileSync } from "fs";
import GameRouter from "./router/game-router.js";
import Cache from "./handler/cache.js";
import logger from "./handler/logger.js";
import { logRequest } from "./middleware/logging.js";

const port = 443;
const app = express();

let caPrivateKeyPath, caCertificatePath;

if (process.env.LOCAL_SERVER == "true") {
  caPrivateKeyPath = "/app/certs/dev/privkey.pem";
  caCertificatePath = "/app/certs/dev/cert.pem";

  logger.info({
    message: "Running app with development certificates (not CA signed).",
    context: "app.ts"
  });
}
else {
  caPrivateKeyPath = "/app/certs/prd/" + process.env.CA_PRIVATE_KEY_NAME;
  caCertificatePath = "/app/certs/prd/" + process.env.CA_CERTIFICATE_NAME;

  logger.info({
    message: "Running app with production certificates (signed by LetsEncrypt).",
    context: "app.ts"
  });
}

const options = {
  key: readFileSync(caPrivateKeyPath),
  cert: readFileSync(caCertificatePath)
};

app.set("view engine", "ejs");
app.set("views", "/app/bin/public/views");

app.use(logRequest());
app.use("/static", express.static("/app/bin/public/static"));

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/three", (_, res) => {
  res.render("three");
});

app.use("/game", GameRouter);

Cache.createCategory("game");

https.createServer(options, app).listen(port, () => {
  logger.info({
    message: `Application listening to port ${port}.`,
    context: "app.ts"
  });
});