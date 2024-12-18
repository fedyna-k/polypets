import express from "express";
import Shop from "../handler/shop.js";

const ShopRouter = express.Router();
ShopRouter.use(express.json());

ShopRouter.get("/create/:gameId", (req, res) => {
    res.send(Shop.create(req.params.gameId, "Kevinou"));
});

ShopRouter.get("/:gameId", (req, res) => {
    res.send(Shop.find(req.params.gameId));
});

export default ShopRouter;