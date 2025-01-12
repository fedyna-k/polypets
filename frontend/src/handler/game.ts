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

function join(id: string) {
  const params = {
    category: "game",
    criteria: { id }
  };

  const result = Cache.find(params);

  if (!result || result.length == 0) {
    throw new Error("La partie n'exite pas.");
  }

  return result[0];
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
  join,
  all
};