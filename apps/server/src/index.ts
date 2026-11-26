import { createApp } from "./app";
import { env } from "./config/env";
import { sql } from "./db/client";
import { createCollaborationServer } from "./modules/canvases/canvas-collaboration";
import { logger } from "./shared/logger";

const server = createCollaborationServer((request, response) =>
  app(request, response),
);
const app = createApp(server.hocuspocus);
await server.listen();
logger.info(`Trace API started on port ${env.PORT}`);

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Trace API stopping: ${signal}`);
  try {
    await server.destroy();
    await sql.end({ timeout: 5 });
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Trace API failed to stop");
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
