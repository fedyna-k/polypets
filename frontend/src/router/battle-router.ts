import express from "express";
import Battle from "../handler/battle.js";

const BattleRouter = express.Router();
BattleRouter.use(express.json());

BattleRouter.get("/create/:gameId", (req, res) => {
    res.send(Battle.create(req.params.gameId));
});

BattleRouter.get("/:gameId", (req, res) => {
    res.send(Battle.find(req.params.gameId));
});

export default BattleRouter;