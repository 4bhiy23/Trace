import { type ApiError } from "@trace/shared";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    code?: string,
    fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/**
 * Standard fetch wrapper for Trace REST APIs.
 * Automatically parses JSON and extracts standardized ApiError structures on failure.
 */
export async function apiClient<T>(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    let code: string | undefined;
    let fields: Record<string, string[]> | undefined;

    try {
      const errorJson = (await response.json()) as Partial<ApiError>;
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
      code = errorJson.code;
      fields = errorJson.fields;
    } catch {
      // Non-JSON error payload
    }

    throw new ApiClientError(response.status, errorMessage, code, fields);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
