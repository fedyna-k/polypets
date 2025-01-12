import express from "express";
import Battle from "../handler/battle.js";

const BattleRouter = express.Router();
BattleRouter.use(express.json());

BattleRouter.get("/request", (req, res) => {
    const jsonData = req.body;
    res.send(Battle.storeBattleRequest(jsonData));
});

BattleRouter.get("/:gameId", (req, res) => {
    res.send(Battle.find(req.params.gameId));
});

BattleRouter.get("/simulate/:gameId", (req, res) => {
    res.send(Battle.createBattle(req.params.gameId));
});

export default BattleRouter;