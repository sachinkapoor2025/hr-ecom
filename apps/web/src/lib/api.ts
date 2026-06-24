import { apiUrl } from "@/lib/env";

const API_URL = apiUrl;

export async function api<T>(
  path: string,
  options: RequestInit & { sessionId?: string; token?: string } = {}
): Promise<T> {
  const { sessionId, token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (sessionId) headers["X-Session-Id"] = sessionId;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    next: { revalidate: path.startsWith("/products") ? 60 : 0 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "API error");
  }

  return res.json();
}

export { API_URL };
