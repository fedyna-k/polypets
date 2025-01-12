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
app.use(express.json());

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/create", (_, res) => {
  res.render("create-game");
});

app.get("/join", (_, res) => {
  res.render("join-game");
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
Cache.createCategory("battle-state");

GameData.initializeData();

// Creating server
const server = https.createServer(options, app);
const io = new Server(server);

let roomCounter = 0;

io.on("connection", (socket: Socket) => {
  console.log("[WebSocket] Nouvelle connexion");

  // When a player creates a game
  socket.on("create-game", (gameId: string) => {
    // Create a new room with the gameId
    socket.join(gameId);
    console.log(`[WebSocket] Partie ${gameId} créée et joueur ajouté à la room`);

    // Send a response to the player
    socket.emit("game-created", { gameId, message: `[WebSocket] Partie ${gameId} créée avec succès.` });
  });

  // When a player joins an existing game
  socket.on("join-game", (gameId: string) => {
    const room = io.sockets.adapter.rooms.get(gameId);

    if (room) {
      socket.join(gameId);
      console.log(`[WebSocket] Joueur ajouté à la room de la partie ${gameId}`);

      // Notify other players that this player joined the game
      io.to(gameId).emit("player-joined", { gameId, message: "[WebSocket] Un nouveau joueur a rejoint la partie.", playerInfo: "L'autre joueur se prépare." });

      // Send a response to the concerned player
      socket.emit("game-joined", { gameId, message: "[WebSocket] Vous avez rejoint la partie." });
    } else {
      console.log(`[WebSocket] La partie ${gameId} n'existe pas`);
      socket.emit("error", "[WebSocket]  La partie spécifiée n'existe pas.");
    }
  });

  // When the battle result is ready, send it to all players
  socket.on("send-battle-result", (gameId: string, battleResult) => {
    io.to(gameId).emit("battle-result", battleResult);
    console.log(`[WebSocket] Résultat du combat envoyé à la room ${gameId}:`, battleResult);
  });

  // When a pc joins the video room
  socket.on("join-pc", () => {
    const roomId = roomCounter.toString().padStart(4, "0");
    roomCounter += 1;

    socket.join(roomId);
    console.log(`[WebSocket] PC ajouté à la room: ${roomId}`);

    socket.emit("init", `/phone/${roomId}`);

  });

  // When a phone joins the video room
  socket.on("join-phone", (roomId: string) => {
    const room = io.sockets.adapter.rooms.get(roomId); 
    if (room) {
      socket.join(roomId); 
      console.log(`[WebSocket] Téléphone rejoint la room: ${roomId}`);

      io.to(roomId).emit("signal", "phone-connected");
    } else {
      console.log(`[WebSocket] Room non trouvée: ${roomId}`);
      socket.emit("error", "[WebSocket] Room non trouvée");
    }
  });

  socket.on("signal", (data) => {
    const { roomId, signalData } = data;
    if (roomId) {
        console.log(`Signal transmis à la room ${roomId} :`, signalData);
        socket.to(roomId).emit("signal", signalData);
    }
  });

  socket.on("disconnect", () => {
      console.log("[WebSocket] Déconnexion");
      io.emit("connexion-lost");
  });
});

// Launching server
server.listen(port, () => {
  logger.info({
    message: `Application listening to port ${port}.`,
    context: "app.ts"
  });
});

export { io };