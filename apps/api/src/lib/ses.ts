import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

const region = process.env.SES_AWS_REGION || process.env.AWS_REGION || "us-east-1";

let client: SESv2Client | null = null;

function getClient(): SESv2Client {
  if (!client) {
    client = new SESv2Client({ region });
  }
  return client;
}

export type SesSendInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  configurationSetName?: string;
};

/** Send one email via Amazon SES API (not SMTP). */
export async function sendViaSes(input: SesSendInput): Promise<{ messageId?: string }> {
  const from = `${input.fromName} <${input.fromEmail}>`;
  const result = await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [input.to] },
      ReplyToAddresses: input.replyTo ? [input.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: input.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: input.html, Charset: "UTF-8" },
            ...(input.text
              ? { Text: { Data: input.text, Charset: "UTF-8" } }
              : {}),
          },
        },
      },
      ConfigurationSetName: input.configurationSetName || process.env.SES_CONFIGURATION_SET || undefined,
    })
  );
  return { messageId: result.MessageId };
}

export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10_000);
}
