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

app.get("/image", (_, res) => {
  res.render("image");
});

app.get("/phone/:id", (req, res) => {
  const roomId = req.params.id;
  res.render("phone-video", { roomId }); 
});

app.get("/phone", (_, res) => {
  res.render("phone-video");
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
const SERVER_IP = "192.168.1.18"; // A modifier

// Compteur de room
let roomCounter = 0; 


io.on("connection", (socket: Socket) => {
  console.log("Nouvelle connexion WebSocket");

  socket.on("join-pc", () => {
    const roomId = roomCounter.toString().padStart(4, "0"); 
    roomCounter += 1; 

    socket.join(roomId); 
    console.log(`PC ajouté à la room: ${roomId}`);

    socket.emit("init", `https://${SERVER_IP}/phone/${roomId}`);

  });

  socket.on("join-phone", (roomId: string) => {
    const room = io.sockets.adapter.rooms.get(roomId); 
    if (room) {
      socket.join(roomId); 
      console.log(`Téléphone rejoint la room: ${roomId}`);

      io.to(roomId).emit("signal", "phone-connected");
    } else {
      console.log(`Room non trouvée: ${roomId}`);
      socket.emit("error", "Room non trouvée");
    }
  });

  socket.on("signal", (data) => {
    const { roomId, signalData } = data;
    if (roomId) {
        socket.to(roomId).emit("signal", signalData);
    }
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