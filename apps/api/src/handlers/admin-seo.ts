import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { requireAdmin } from "../lib/auth";
import { badRequest, forbidden, ok } from "../lib/response";
import { fetchSearchConsoleReport, searchConsoleDateRange } from "../lib/search-console";

const ALLOWED_DAYS = new Set([7, 28, 90]);

export async function getSeoPerformance(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const raw = event.queryStringParameters?.days;
  const days = raw == null || raw === "" ? 28 : Number(raw);
  if (!ALLOWED_DAYS.has(days)) return badRequest("days must be 7, 28, or 90");
  const range = searchConsoleDateRange(days);
  const report = await fetchSearchConsoleReport(days);
  return ok({
    days,
    startDate: range.startDate,
    endDate: range.endDate,
    searchConsole: {
      connected: report.connected,
      siteUrl: report.siteUrl,
      error: report.error,
      queryRows: report.queries.length,
      pageRows: report.pages.length,
    },
    queries: report.queries,
    pages: report.pages,
  });
}
