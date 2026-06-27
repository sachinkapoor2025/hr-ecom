import { NextResponse } from "next/server";
import { defaultCurrencyForCountry, detectViewerCountry } from "@/lib/geo-currency";

export async function GET() {
  const country = await detectViewerCountry();
  const currency = defaultCurrencyForCountry(country);

  return NextResponse.json(
    { country, currency },
    {
      headers: {
        "Cache-Control": "private, max-age=3600",
      },
    }
  );
}

export const runtime = "nodejs";
