import pino from "pino";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

export const createModuleLogger = (moduleName: string) => {
  // we will create the log directory if it doesn't exist
  const logDir = path.join("logs", moduleName);
  fs.mkdirSync(logDir, { recursive: true });

  const logFile = path.join(logDir, "log.txt");

  const transport = pino.transport({
    targets: [
      // Terminal logging
      {
        target: env.NODE_ENV !== "production" ? "pino-pretty" : "pino/file",
        options:
          env.NODE_ENV !== "production"
            ? {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              }
            : { destination: 1 },
        level: env.NODE_ENV !== "production" ? "debug" : "info",
      },
      // File logging
      {
        target: "pino/file",
        options: { destination: logFile } as unknown as { destination: number },
        level: "debug",
      },
    ],
  });

  return pino(
    {
      level: env.NODE_ENV !== "production" ? "debug" : "info",
      redact: {
        paths: ["req.headers.authorization", "*.password", "body.password"],
        censor: "[REDACTED]",
      },
    },
    transport,
  );
};
