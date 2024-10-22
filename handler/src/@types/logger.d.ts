declare type LoggerParameters = {
  message: string;
  context: string;
  error?: string;
};

declare type LogEntryParameters = {
  type: "info" | "warning" | "error";
} & LoggerParameters;