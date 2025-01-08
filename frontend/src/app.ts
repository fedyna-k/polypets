import express from "express";
import { Server, Socket } from "socket.io";
import https from "https";
import { readFileSync } from "fs";
import GameRouter from "./router/game-router.js";
import Cache from "./handler/cache.js";
import logger from "./handler/logger.js";
import { logRequest } from "./middleware/logging.js";
import path from "path";
import { fileURLToPath } from "url";
import {GameData} from "./models/game-data.js";
import BattleRouter from "./router/battle-router.js";
import ShopRouter from "./router/shop-router.js";

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
app.set("views", "/app/public/views");

app.use(logRequest());
app.use(express.static(path.dirname(fileURLToPath(import.meta.url))));

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/video", (_, res) => {
  res.render("video");
});

app.get("/phone/:id", (req, res) => {
  const roomId = req.params.id;
  res.render("phone-video", { roomId }); 
});

app.get("/view/:view", (req, res) => {
  res.render(`./partials/${req.params.view}`);
});

app.get("/three", (_, res) => {
  res.render("three");
});

app.use("/game", GameRouter);
app.use("/battle", BattleRouter);
app.use("/shop", ShopRouter);

Cache.createCategory("game");
Cache.createCategory("battle");
Cache.createCategory("shop");

GameData.initializeData();

// Creating server
const server = https.createServer(options, app);
const io = new Server(server);


// Compteur de room
//let roomCounter = 0; 


io.on("connection", (socket: Socket) => {
  console.log("Nouvelle connexion WebSocket");

  socket.emit("init", socket.id);

  socket.on("signal", (data) => {
      console.log("Signal reçu :", data);
      socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", () => {
      console.log("Déconnexion WebSocket");
  });
});

// Launching server
server.listen(port, () => {
  logger.info({
    message: `Application listening to port ${port}.`,
    context: "app.ts"
  });
});