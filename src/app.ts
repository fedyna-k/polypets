import express from 'express';
import GameRouter from './router/game-router.js'
import Cache from './handler/cache.js';
import path from "path";

const DEBUG = true;
const app = express();
const port = 5050;

if (DEBUG) {
  // Middleware for request debug
  app.use((req, _res, next) => {
    console.log(`Request received for ${req.url}`);
    next();
  });
}

if (DEBUG) {
  console.log('Path to public folder :', path.join((import.meta.dirname ?? __dirname), '..', 'public'));
}

app.use('/', express.static(path.join((import.meta.dirname ?? __dirname), '..', 'public')));
app.use('/static', express.static(path.join((import.meta.dirname ?? __dirname), '..', 'src', 'static')));

app.use('/game', GameRouter);

Cache.createCategory('game');

app.listen(port, () => {
  console.log(`Application listening to port ${port}. Address : http://localhost:${port}/views/three.html`);
});