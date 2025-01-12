import { randomBytes } from "crypto";
import Cache from "./cache.js";

function create() {
  const bytes = randomBytes(6);
  const randomId = bytes.toString("base64url");

  Cache.add({
    category: "game",
    value: {
      id: randomId
    }
  });

  return {
    id: randomId
  };
}

function all() {
  const params = {
    category: "game",
    criteria: {}
  };

  return Cache.find(params);
}

export default {
  create,
  all
};