import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Get the key that ecrypts the .env file.
 * @returns The AES-256 key.
 */
function readKey(): Buffer {
  const keyPath = join(import.meta.dirname ?? __dirname, "../../..", ".key");
  const rawKey = readFileSync(keyPath, "utf-8");
  
  return Buffer.from(rawKey, "hex");
}

/**
 * Read the .env file and encrypt content.
 * @returns The string buffer after encryption.
 */
function encryptFile(): { data: Buffer, iv: Buffer, auth: Buffer } {
  const filePath = join(import.meta.dirname ?? __dirname, "../../..", ".env");
  const file = readFileSync(filePath, "utf-8");

  if (file.match(/^(?:[0-9a-f]+:){2}[0-9a-f]+$/)) {
    console.error("File already encrypted.");
    process.exit(1);
  }

  const data = Buffer.from(file, "utf-8");
  const iv = randomBytes(16);

  const cipher = createCipheriv("aes-256-gcm", readKey(), iv);
  
  const cryptedUpdate = cipher.update(data);
  const cryptedFinal = cipher.final();

  const auth = cipher.getAuthTag();
  
  return {
    data: Buffer.concat([cryptedUpdate, cryptedFinal]),
    iv,
    auth
  };
}

/**
 * Read the .env file and decrypt content.
 * @returns The string buffer after decryption.
 */
function decryptFile(): { data: Buffer } {
  const filePath = join(import.meta.dirname ?? __dirname, "../../..", ".env");
  const file = readFileSync(filePath, "utf-8");

  if (!file.match(/^(?:[0-9a-f]+:){2}[0-9a-f]+$/)) {
    console.error("File already decrypted.");
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
 * Module mandatory main function for tools.
 * @param args The CLI arguments.
 */
export function handler(args: string[]): void {
  if (args.length != 1) {
    console.error("Usage: npm run tools dotenv <encrypt|decrypt>");
    process.exit(1);
  }

  const filePath = join(import.meta.dirname ?? __dirname, "../../..", ".env");

  if (args[0] == "encrypt") {
    const { data, iv, auth } = encryptFile();
    const fileContent = `${data.toString("hex")}:${iv.toString("hex")}:${auth.toString("hex")}`;
    writeFileSync(filePath, fileContent);
  }
  else if (args[0] == "decrypt") {
    const { data } = decryptFile();
    const fileContent = data.toString("utf-8");
    writeFileSync(filePath, fileContent);
  }
  else if (args[0] == "apply") {
    throw new Error("Not implemented.");
  }
  else {
    console.error("Usage: npm run tools dotenv <encrypt|decrypt>");
    process.exit(1);
  }
}