import { ApiErrorResponse } from "./types";

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = "API_ERROR", status = 400, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api"
    : (process.env.INTERNAL_API_URL || "http://localhost:3201/api"));

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, params, ...customConfig } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${DEFAULT_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customConfig.headers as Record<string, string>),
  };

  // Only add Content-Type: application/json if body is not FormData
  if (!(customConfig.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...customConfig,
      headers,
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const rawData = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorData = rawData as ApiErrorResponse;
      const message =
        errorData?.error?.message ||
        (typeof rawData === "string" ? rawData : "API request failed");
      const code = errorData?.error?.code || `HTTP_${res.status}`;
      const details = errorData?.error?.details;

      throw new ApiClientError(message, code, res.status, details);
    }

    // Handle envelope unwrapping: if payload has { success: true, data: T }, return data
    if (
      rawData &&
      typeof rawData === "object" &&
      "success" in rawData &&
      "data" in rawData
    ) {
      return (rawData as { data: T }).data;
    }

    return rawData as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiClientError) {
      throw err;
    }
    if ((err as Error).name === "AbortError") {
      throw new ApiClientError("Request timeout exceeded", "TIMEOUT", 408);
    }
    throw new ApiClientError(
      (err as Error).message || "Network connection failure",
      "NETWORK_ERROR",
      0
    );
  }
}
