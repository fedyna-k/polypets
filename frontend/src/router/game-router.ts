import express from "express";
import Game from "../handler/game.js";

const GameRouter = express.Router();
GameRouter.use(express.json());

GameRouter.get("/create", (_, res) => {
  res.send(Game.create());
});

GameRouter.get("/join/:gameId", (req, res) => {
  const gameId = req.params.gameId;
  
  try {
    const game = Game.join(gameId);
    res.send(game);
  }
  catch {
    res.status(400).json({ message: "La partie n'existe pas." });
  }
});

GameRouter.get("/all", (_, res) => {
  res.send(Game.all());
});

export default GameRouter;