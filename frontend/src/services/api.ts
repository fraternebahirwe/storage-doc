const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4100";

export class ApiRequestError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string[] | undefined>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string[] | undefined>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = data?.error;
    throw new ApiRequestError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? "Something went wrong. Please try again.",
      error?.fields,
    );
  }

  return data as T;
}
