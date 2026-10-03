import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./apps/server/src/db/schema/**/*.ts",
  out: "./apps/server/drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://trace:trace@localhost:55432/trace",
  },
});
