import type { Response } from "express";
import type { ApiError } from "@trace/shared";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiError["code"],
    message: string,
  ) {
    super(message);
  }
}

export function sendError(response: Response, error: unknown) {
  if (error instanceof ZodError) {
    const fields = error.issues.reduce<Record<string, string[]>>(
      (result, issue) => {
        const field = issue.path.join(".");
        result[field] ??= [];
        result[field].push(issue.message);
        return result;
      },
      {},
    );

    response.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      fields,
    } satisfies ApiError);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
    } satisfies ApiError);
    return;
  }

  response.status(500).json({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  } satisfies ApiError);
}
