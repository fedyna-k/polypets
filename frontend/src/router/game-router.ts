import express from "express";
import Game from "../handler/game.js";

const GameRouter = express.Router();
GameRouter.use(express.json());

GameRouter.get("/", (_, res) => {
  res.send(Game.create());
});

GameRouter.get("/all", (_, res) => {
  res.send(Game.all());
});

export default GameRouter;