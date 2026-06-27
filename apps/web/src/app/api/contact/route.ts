import { NextResponse } from "next/server";
import { contactFormSchema } from "@hr-ecom/shared";
import { sendContactFormEmails } from "@/lib/smtp";
import { getApiUrl } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const { name, email, phone, message, sessionId } = parsed.data;

    const emailResult = await sendContactFormEmails({ name, email, phone, message });

    if (!emailResult.ok && !emailResult.skipped) {
      return NextResponse.json(
        {
          error:
            emailResult.error ??
            "Could not send email. Please try WhatsApp or email order@usarakhi.com directly.",
        },
        { status: 502 }
      );
    }

    if (emailResult.skipped) {
      return NextResponse.json(
        {
          error:
            "Email is not configured on the server yet. Please contact us on WhatsApp or at order@usarakhi.com.",
        },
        { status: 503 }
      );
    }

    // Save lead to API (best-effort — email already sent)
    if (sessionId) {
      try {
        await fetch(`${getApiUrl()}/leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": sessionId,
          },
          body: JSON.stringify({
            sessionId,
            name,
            email,
            phone,
            page: "/contact",
            source: "contact",
            metadata: { message, emailSent: "true" },
          }),
        });
      } catch {
        /* non-blocking */
      }
    }

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error("contact route error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";
