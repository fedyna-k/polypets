import express from "express";
import Battle from "../handler/battle.js";
import Game from "../handler/game.js";

const BattleRouter = express.Router();
BattleRouter.use(express.json());

BattleRouter.get("/", (_, res) => {
    const game = Game.create();
    res.send(Battle.create(game.id));
});

export default BattleRouter;