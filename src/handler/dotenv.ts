import { readFileSync } from "fs";
import { join } from "path";
import { createDecipheriv } from "crypto";
import logger from "./logger.js";


/**
 * Get the key that ecrypts the .env file.
 * @returns The AES-256 key.
 */
function readKey(): Buffer {
  const keyPath = join(import.meta.dirname ?? __dirname, "../..", ".key");
  const rawKey = readFileSync(keyPath, "utf-8");
  
  return Buffer.from(rawKey, "hex");
}

/**
 * Read the .env file and decrypt content.
 * @returns The string buffer after decryption.
 */
function decryptFile(): { data: Buffer } {
  const filePath = join(import.meta.dirname ?? __dirname, "../..", ".env");
  const file = readFileSync(filePath, "utf-8");

  if (!file.match(/^(?:[0-9a-f]+:){2}[0-9a-f]+$/)) {
    logger.error({
      message: "The .env file is not encrypted.",
      context: "dotenv.ts"
    });
    process.exit(1);
  }

  const [data, iv, auth] = file.split(":").map(text => Buffer.from(text, "hex"));  
  const decipher = createDecipheriv("aes-256-gcm", readKey(), iv!);
  decipher.setAuthTag(auth!);

  const decryptedUpdate = decipher.update(data!);
  const decryptedFinal = decipher.final();

  return {
    data: Buffer.concat([decryptedUpdate, decryptedFinal])
  };
}

/**
 * Read and apply all environement variable at runtime.
 */
export function setupEnvironment() {
  const { data } = decryptFile();
  const lines = data.toString("utf-8").split("\n");
  
  for (const line of lines) {
    if (line.startsWith("#") || line.trim() == "") {
      continue;
    }

    const [ key, value ] = line.split("=");
    if (key == undefined || value == undefined) {
      logger.error({
        message: "Malformed .env file.",
        context: "dotenv.ts"
      });
      process.exit(1);
    }

    process.env[key] = value;
  }
}