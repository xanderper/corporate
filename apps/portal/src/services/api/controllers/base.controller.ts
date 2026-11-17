import { NextResponse } from "next/server";
import { ApiSuccessResponse, ApiErrorResponse, ApiErrorCode } from "../types/api-response";

export class BaseController {
  /**
   * Returns a standard successful API response
   */
  protected ok<T>(
    data: T,
    status = 200,
    meta?: ApiSuccessResponse<T>["meta"]
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          ...meta,
        },
      },
      { status }
    );
  }

  /**
   * Returns a standard error API response
   */
  protected error(
    message: string,
    code: ApiErrorCode | string = "BAD_REQUEST",
    status = 400,
    details?: unknown
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(details !== undefined ? { details } : {}),
        },
      },
      { status }
    );
  }

  /**
   * Returns a 500 internal server error without leaking stack traces
   */
  protected internalError(
    err: unknown,
    message = "An unexpected error occurred"
  ): NextResponse<ApiErrorResponse> {
    console.error("[API_ERROR]:", err);
    return this.error(message, "INTERNAL_SERVER_ERROR", 500);
  }
}
