import { site } from "@/lib/site";
import { siteUrl } from "@/lib/env";

/** humans.txt — credits and site info for curious humans and crawlers. */
export async function GET() {
  const body = `/* TEAM */
Store: ${site.name}
Site: ${siteUrl}
Contact: ${site.supportEmail}
Phone: ${site.phone}

/* THANKS */
Sisters and brothers who trust UsaRakhi for Raksha Bandhan
Open source: Next.js, AWS Lambda, DynamoDB

/* SITE */
Last update: 2026-06-25
Language: English
Standards: HTML5, CSS3, JSON-LD, llms.txt
Purpose: Online Rakhi delivery to all 50 US states

/* AI */
For AI assistants see: ${siteUrl}/llms.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
