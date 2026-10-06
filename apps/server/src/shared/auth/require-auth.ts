import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { auth } from "../../modules/auth/auth";
import { createDefaultWorkspace } from "../../modules/workspaces/workspace.service";
import { HttpError } from "../http/errors";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  void auth.api
    .getSession({ headers: fromNodeHeaders(request.headers) })
    .then(async (session) => {
      if (!session) {
        next(new HttpError(401, "UNAUTHORIZED", "Sign in required"));
        return;
      }

      await createDefaultWorkspace(session.user.id, session.user.name);
      response.locals.user = session.user;
      next();
    })
    .catch(next);
}

/**
 * Returns the user set by authentication middleware, or throws 401 when absent.
 */
export const getCurrentUser = (response: Response) => {
  const user = response.locals.user as
    { id: string; name: string; email: string } | undefined;
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
  return user;
};

export function getRouteParam(request: Request, name: string) {
  const value = request.params[name];
  if (typeof value !== "string") {
    throw new HttpError(400, "BAD_REQUEST", `Invalid ${name}`);
  }
  return value;
}

export function getUuidParam(request: Request, name: string) {
  const value = getRouteParam(request, name);
  if (!z.string().uuid().safeParse(value).success) {
    throw new HttpError(400, "BAD_REQUEST", `Invalid ${name}`);
  }
  return value;
}
