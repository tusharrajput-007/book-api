import { env } from "../config/env";

export const loggerConfig =
  env.NODE_ENV !== "production"
    ? {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
        redact: {
          paths: ["req.headers.authorization", "*.password", "body.password"],
          censor: "[REDACTED]",
        },
      }
    : {
        level: "info",
        redact: {
          paths: ["req.headers.authorization", "*.password", "body.password"],
          censor: "[REDACTED]",
        },
      };
