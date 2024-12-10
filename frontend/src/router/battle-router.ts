import express from "express";
import Battle from "../handler/battle.js";

const BattleRouter = express.Router();
BattleRouter.use(express.json());

BattleRouter.get("/:gameId", (req, res) => {
    res.send(Battle.create(req.params.gameId));
});

export default BattleRouter;