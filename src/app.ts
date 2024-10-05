import express from "express";
import GameRouter from "./router/game-router.js";
import Cache from "./handler/cache.js";
import path from "path";
import logger from "./handler/logger.js";

const DEBUG = true;
const app = express();
const port = 5050;

if (DEBUG) {
  // Middleware for request debug
  app.use((req, _res, next) => {
    logger.info({
      message: `Request received for ${req.url}`,
      context: "app.ts"
    });
    next();
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname ?? __dirname, "public/views"));
app.use("/static", express.static(path.join(import.meta.dirname ?? __dirname, "public/static")));

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/three", (_, res) => {
  res.render("three");
});

app.use("/game", GameRouter);

Cache.createCategory("game");

app.listen(port, () => {
  logger.info({
    message: `Application listening to port ${port}. Address : http://localhost:${port}/views/three.html`,
    context: "app.ts"
  });
});