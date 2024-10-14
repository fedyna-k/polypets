import express from "express";
import https from "https";
import path from "path";
import { readFileSync } from "fs";
import GameRouter from "./router/game-router.js";
import Cache from "./handler/cache.js";
import logger from "./handler/logger.js";
import { setupEnvironment } from "./handler/dotenv.js";
import { logRequest } from "./middleware/logging.js";

setupEnvironment();

const port = 443;
const app = express();

if (process.argv.includes("local")) {
  process.env.CA_PRIVATE_KEY = "certs/privkey.pem";
  process.env.CA_CERTIFICATE = "certs/cert.pem";

  logger.info({
    message: "Running app with local certificates (not CA signed).",
    context: "app.ts"
  });
}

const options = {
  key: readFileSync(process.env.CA_PRIVATE_KEY),
  cert: readFileSync(process.env.CA_CERTIFICATE)
};

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname ?? __dirname, "public/views"));

app.use(logRequest());
app.use("/static", express.static(path.join(import.meta.dirname ?? __dirname, "public/static")));

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