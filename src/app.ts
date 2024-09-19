import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import GameRouter from './router/game-router.js'
import Cache from './handler/cache.js';

const DEBUG = true;
const app = express();
const port = 5050;

if (DEBUG) {
  // Middleware for request debug
  app.use((req, _res, next) => {
    console.log(`Request received for ${req.url}`);"-"
    next();
  });
}

// Serving statics files from public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (DEBUG) {
  console.log('Path to public folder :', path.join(__dirname, '..', 'public'));
}
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/game', GameRouter);

Cache.createCategory('game');

app.listen(port, () => {
  console.log(`Application listening to port ${port}`);
});