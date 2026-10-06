import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { env } from "../../config/env";
import { createDefaultWorkspace } from "../workspaces/workspace.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_URL],
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await createDefaultWorkspace(createdUser.id, createdUser.name);
        },
      },
    },
  },
});
