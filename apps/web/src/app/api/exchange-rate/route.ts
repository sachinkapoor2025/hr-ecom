import { NextResponse } from "next/server";

/** Store exchange rate — 1 USD = 94 INR (override via NEXT_PUBLIC_USD_INR_RATE). */
const USD_INR_RATE = Number(process.env.NEXT_PUBLIC_USD_INR_RATE) || 94;

export async function GET() {
  return NextResponse.json(
    { rate: USD_INR_RATE, source: "configured", date: new Date().toISOString().slice(0, 10) },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
