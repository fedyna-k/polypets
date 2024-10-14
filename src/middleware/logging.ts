import { RequestHandler } from "express";
import logger from "../handler/logger.js";

/**
 * Creates good middleware based on DEBUG env var.
 * @returns The RequestHandler middleware to log requests.
 */
export function logRequest(): RequestHandler {
  if (process.env.DEBUG == "true") {
    return (req, _res, next) => {
      logger.info({
        message: `${req.method.toUpperCase()} request received for ${req.url} (from ip: ${req.ip})`,
        context: "middleware/logging.ts"
      });    
      next();
    };
  } else {
    return (_req, _res, next) => {
      next();
    };
  }
}