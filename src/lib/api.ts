export const API_BASE = "http://localhost:8080";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/** Fetch con interceptor: agrega Authorization: Bearer <token> automáticamente. */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    signal: options.signal ?? null,
    body: options.body !== undefined ? JSON.stringify(options.body) : null,
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
