import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "TRAIN_NOT_FOUND"
  | "PROVIDER_UNAVAILABLE"
  | "RATE_LIMITED"
  | "DATA_STALE"
  | "INTERNAL_ERROR";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
  };
}

export class AppError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode: number = 400,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  statusCode = 400,
  retryable = false
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        retryable,
      },
    },
    { status: statusCode }
  );
}

export function handleApiError(err: unknown): NextResponse<ApiErrorResponse> {
  console.error("API Error caught:", err);

  if (err instanceof AppError) {
    return createErrorResponse(err.code, err.message, err.statusCode, err.retryable);
  }

  return createErrorResponse(
    "INTERNAL_ERROR",
    "An unexpected error occurred while processing your request.",
    500,
    true
  );
}
