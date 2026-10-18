import { createApp } from "./app";
import { env } from "./config/env";
import { sql } from "./db/client";
import { logger } from "./shared/logger";

const server = createApp().listen(env.PORT, () => {
  logger.info(`Trace API started on port ${env.PORT}`);
});

let shuttingDown = false;

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Trace API stopping: ${signal}`);
  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, "Trace API failed to stop");
      process.exit(1);
      return;
    }

    try {
      await sql.end({ timeout: 5 });
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Trace database failed to stop");
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
