import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const serverEnv = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(serverEnv)) process.loadEnvFile(serverEnv);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  WEB_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
