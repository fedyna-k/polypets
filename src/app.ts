import express from "express";
import GameRouter from "./router/game-router.js"
import Cache from "./handler/database.js";

const app = express();
const port = 5050;

app.use("/game", GameRouter);

app.get("/cache", (_, res) => {
  res.send(Cache.$instance);
})

Cache.createCategory("game");

app.listen(port, () => {
  console.log(`Application listening to port ${port}`);
});