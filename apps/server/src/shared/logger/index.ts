import type { RequestHandler } from "express";
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: false,
            hideObject: true,
            messageFormat: "{msg}",
            ignore: "pid,hostname,level,time",
          },
        },
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "token",
  ],
});

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const latency = Math.round(performance.now() - startedAt);
    logger.info(
      `${request.method} ${request.originalUrl} ${response.statusCode} ${latency}ms`,
    );
  });

  next();
};
