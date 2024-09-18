import express from "express";
import GameRouter from "./router/game-router.js"
import Cache from "./handler/cache.js";

const app = express();
const port = 5050;

app.use("/game", GameRouter);

Cache.createCategory("game");

app.listen(port, () => {
  console.log(`Application listening to port ${port}`);
});