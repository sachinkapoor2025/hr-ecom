import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { route } from "./router";

function errorMessage(err: unknown): string {
  const raw = err instanceof Error && err.message.trim() ? err.message : "Internal server error";
  if (/sk_(live|test)_|rk_(live|test)_|pk_(live|test)_|whsec_/i.test(raw)) {
    return "Payment could not be started. Please try again or use another payment method.";
  }
  return raw;
}

export async function handler(
  event: APIGatewayProxyEventV2,
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  try {
    return await route(event);
  } catch (err) {
    const message = errorMessage(err);
    console.error("Unhandled API error:", {
      path: event.rawPath ?? event.requestContext?.http?.path,
      method: event.requestContext?.http?.method,
      message,
      err,
    });
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Id",
      },
      body: JSON.stringify({ error: message }),
    };
  }
}
