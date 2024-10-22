import { randomBytes } from "crypto";
import Cache from "./cache.js";

function create() {
  const bytes = randomBytes(6);
  const randomId = bytes.toString("base64");

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

export default {
  create
};