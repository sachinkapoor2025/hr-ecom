import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge 301: apex → www (and http → https is handled by Amplify/CloudFront).
 * Keeps canonical host aligned with metadataBase / Open Graph.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === "usarakhi.com") {
    const url = request.nextUrl.clone();
    url.host = "www.usarakhi.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static assets; redirect everything else from apex.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
