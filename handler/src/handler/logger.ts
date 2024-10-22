import { appendFile } from "fs";

const serverTag = renderText("polypets", [1, 90]);

/**
 * Apply ANSI codes to a given text for console rendering.
 * @param text The text to render.
 * @param codes The ANSI escape codes.
 * @returns The rendered text.
 */
function renderText(text: string, codes: number[]): string {
  const codesString = codes
    .map(code => `\x1b[${code}m`)
    .join("");
  return `${codesString}${text}\x1b[0m`;
}

/**
 * Append log entry to log file, depending on log type.
 * @param params The parameters given in the log function and the type of log.
 */
function appendLog(params: LogEntryParameters): void {
  const date = (new Date()).toISOString();
  const type = params.type.toUpperCase().padEnd(7, " ");

  const logEntry = `[${date}] ${type} (${params.context}) ${params.message} ${params.error ?? ""}\n`;
  const file = params.type == "error" ? "/logs/error.log" : "/logs/server.log";

  appendFile(file, logEntry, "utf-8", () => {});
}

/**
 * Logs an info inside the console.
 * @param params The parameters to display.
 */
function info(params: LoggerParameters): void {
  const tag = renderText("info ", [1, 96]);
  console.log(`${serverTag} ${tag} (${params.context}) ${params.message}`);
  appendLog({ ...params, type: "info" });
}

/**
 * Logs a warning inside the console.
 * @param params The parameters to display.
 */
function warn(params: LoggerParameters): void {
  const tag = renderText("warn ", [1, 93]);
  console.warn(`${serverTag} ${tag} (${params.context}) ${params.message}`);
  appendLog({ ...params, type: "warning" });
}

/**
 * Logs an error inside the console.
 * @param params The parameters to display.
 */
function error(params: LoggerParameters): void {
  const tag = renderText("error", [1, 91]);
  console.error(`${serverTag} ${tag} (${params.context}) ${params.message} ${params.error ?? ""}`);
  appendLog({ ...params, type: "error" });
}

export default { info, warn, error };