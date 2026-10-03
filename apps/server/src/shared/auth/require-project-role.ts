import type { RequestHandler } from "express";
import { and, eq } from "drizzle-orm";
import type { Role } from "@trace/shared";
import { db } from "../../db/client";
import { projectMember } from "../../db/schema";
import { getCurrentUser, getUuidParam } from "./require-auth";
import { HttpError } from "../http/errors";

export function requireProjectRole(...allowedRoles: Role[]): RequestHandler {
  return async (request, response, next) => {
    try {
      const user = getCurrentUser(response);
      const membership = await db.query.projectMember.findFirst({
        where: and(
          eq(projectMember.projectId, getUuidParam(request, "projectId")),
          eq(projectMember.userId, user.id),
        ),
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        throw new HttpError(403, "FORBIDDEN", "Project access denied");
      }

      response.locals.projectMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
}
