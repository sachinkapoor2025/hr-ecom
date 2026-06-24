import type { APIGatewayProxyResultV2 } from "aws-lambda";

export function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Session-Id",
    },
    body: JSON.stringify(body),
  };
}

export function ok(body: unknown) {
  return json(200, body);
}

export function created(body: unknown) {
  return json(201, body);
}

export function badRequest(message: string) {
  return json(400, { error: message });
}

export function unauthorized(message = "Unauthorized") {
  return json(401, { error: message });
}

export function forbidden(message = "Forbidden") {
  return json(403, { error: message });
}

export function notFound(message = "Not found") {
  return json(404, { error: message });
}

export function serverError(message = "Internal server error") {
  return json(500, { error: message });
}
