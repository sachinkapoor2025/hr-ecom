import type { APIGatewayProxyEventV2 } from "aws-lambda";

export interface AuthContext {
  userId: string;
  email: string;
  isAdmin: boolean;
}

const DEV_AUTH_ENABLED =
  process.env.DEV_AUTH_ENABLED === "true" || process.env.ENVIRONMENT === "local";

/** Decode JWT payload or dev token for local testing. */
export function getAuth(event: APIGatewayProxyEventV2): AuthContext | null {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  if (token.startsWith("dev:") && DEV_AUTH_ENABLED) {
    const [, email, role] = token.split(":");
    if (!email) return null;
    return {
      userId: `dev-${email}`,
      email,
      isAdmin: role === "admin",
    };
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    const groups: string[] = payload["cognito:groups"] ?? [];
    return {
      userId: payload.sub as string,
      email: (payload.email as string) ?? "",
      isAdmin: groups.includes("admin"),
    };
  } catch {
    return null;
  }
}

export function getSessionId(event: APIGatewayProxyEventV2): string | undefined {
  return event.headers?.["x-session-id"] ?? event.headers?.["X-Session-Id"];
}

export function getUserOrSessionKey(event: APIGatewayProxyEventV2): string | null {
  const auth = getAuth(event);
  if (auth) return auth.userId;
  const sessionId = getSessionId(event);
  return sessionId ?? null;
}

export function requireAdmin(event: APIGatewayProxyEventV2): AuthContext | null {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return null;
  return auth;
}
