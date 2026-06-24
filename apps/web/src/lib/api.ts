import { getApiUrl } from "@/lib/env";

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

  const url = `${getApiUrl()}${path}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: typeof window === "undefined" ? "no-store" : "default",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API error (${res.status})`);
  }

  return res.json();
}

export { getApiUrl as API_URL };
