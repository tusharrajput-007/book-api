import pino from "pino";
import type { TransportTargetOptions } from "pino";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

export const createModuleLogger = (moduleName: string) => {
  // we will create the log directory if it doesn't exist
  const logDir = path.join("logs", moduleName);
  fs.mkdirSync(logDir, { recursive: true });

  const logFile = path.join(logDir, "log.txt");

  const fileTarget: TransportTargetOptions = {
    target: "pino/file",
    options: { destination: logFile },
    level: "debug",
  };

  const terminalTarget: TransportTargetOptions =
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
          level: "debug",
        }
      : {
          target: "pino/file",
          options: { destination: 1 },
          level: "info",
        };

  const transport = pino.transport({
    targets: [terminalTarget, fileTarget],
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
