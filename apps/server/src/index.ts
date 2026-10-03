import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";

const server = createApp().listen(env.PORT, () => {
  logger.info(`Trace API started on port ${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`Trace API stopping: ${signal}`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
