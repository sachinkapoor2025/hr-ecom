import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import {
  createSesCampaignSchema,
  updateSesCampaignSchema,
  uploadSesRecipientsSchema,
  createSesTemplateSchema,
  sesSettingsSchema,
  suppressEmailSchema,
  sendTestEmailSchema,
  renderSesTemplate,
  DEFAULT_SENDER_MESSAGE_FOOTER,
  sesEmailKeys,
  type SesCampaign,
  type SesSettings,
  type SesRecipient,
} from "@hr-ecom/shared";
import { docClient, now, dayBucket } from "../lib/db";
import { ok, created, badRequest, notFound, forbidden, unauthorized } from "../lib/response";
import { requireEmailAccess, getAuth } from "../lib/auth";
import { sendViaSes, htmlToText } from "../lib/ses";

const TABLE = process.env.EMAIL_CAMPAIGNS_TABLE ?? `hr-ecom-email-campaigns-${process.env.ENVIRONMENT ?? "dev"}`;
const SITE_URL = (process.env.SITE_URL ?? "https://www.usarakhi.com").replace(/\/$/, "");

function defaultSettings(): SesSettings {
  return sesSettingsSchema.parse({
    awsRegion: process.env.SES_AWS_REGION || process.env.AWS_REGION || "us-east-1",
    defaultSenderName: "UsaRakhi",
    defaultSenderEmail: process.env.SES_FROM_EMAIL || "order@usarakhi.com",
    defaultReplyTo: process.env.SES_REPLY_TO || "order@usarakhi.com",
    dailyLimit: 50_000,
    maxSendRatePerMinute: 600,
    batchSize: 50,
    delayBetweenBatchesMs: 5000,
    concurrentWorkers: 5,
    companyName: DEFAULT_SENDER_MESSAGE_FOOTER.companyName,
    companyAddress: DEFAULT_SENDER_MESSAGE_FOOTER.companyAddress,
    contactEmail: DEFAULT_SENDER_MESSAGE_FOOTER.contactEmail,
    privacyUrl: DEFAULT_SENDER_MESSAGE_FOOTER.privacyUrl,
  });
}

async function loadSettings(): Promise<SesSettings> {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.settingsPk(), SK: sesEmailKeys.settingsSk() },
    })
  );
  if (!res.Item) return defaultSettings();
  return sesSettingsSchema.parse({ ...defaultSettings(), ...res.Item.settings });
}

async function isSuppressed(email: string): Promise<boolean> {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.suppressPk(email), SK: sesEmailKeys.suppressSk() },
    })
  );
  return Boolean(res.Item);
}

async function addNotification(message: string, level: "info" | "success" | "error" = "info") {
  const id = randomUUID();
  const ts = now();
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: sesEmailKeys.notifyPk(id),
        SK: sesEmailKeys.notifySk(),
        GSI1PK: sesEmailKeys.entityNotifyPk(),
        GSI1SK: ts,
        id,
        message,
        level,
        createdAt: ts,
        read: false,
      },
    })
  );
}

function buildFooter(settings: SesSettings, unsubUrl: string): string {
  const company = settings.companyName || DEFAULT_SENDER_MESSAGE_FOOTER.companyName;
  const address = settings.companyAddress || DEFAULT_SENDER_MESSAGE_FOOTER.companyAddress;
  const contact = settings.contactEmail || DEFAULT_SENDER_MESSAGE_FOOTER.contactEmail;
  const privacy = settings.privacyUrl || DEFAULT_SENDER_MESSAGE_FOOTER.privacyUrl;
  return `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.5;font-family:Arial,sans-serif">
  <p style="margin:0 0 8px"><strong>${company}</strong><br/>${address}<br/>
  <a href="mailto:${contact}" style="color:#4876e8">${contact}</a></p>
  <p style="margin:0">
    <a href="${privacy}" style="color:#4876e8">Privacy Policy</a>
    &nbsp;·&nbsp;
    <a href="${unsubUrl}" style="color:#4876e8">Unsubscribe</a>
  </p>
</div>`;
}

function injectTracking(html: string, openToken: string, linkMap: Map<string, string>): string {
  let out = html;
  out = out.replace(/href=(["'])(https?:\/\/[^"']+)\1/gi, (_m, q, url) => {
    if (url.includes("/email/click/") || url.includes("/email/unsubscribe/")) {
      return `href=${q}${url}${q}`;
    }
    const token = randomUUID().replace(/-/g, "").slice(0, 24);
    linkMap.set(token, url);
    return `href=${q}${SITE_URL}/email/click/${token}${q}`;
  });
  const pixel = `<img src="${SITE_URL}/email/open/${openToken}" width="1" height="1" alt="" style="display:none" />`;
  if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${pixel}</body>`);
  else out += pixel;
  return out;
}

async function getCampaign(campaignId: string): Promise<SesCampaign | null> {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.campaignPk(campaignId), SK: sesEmailKeys.campaignSk() },
    })
  );
  return (res.Item as SesCampaign | undefined) ?? null;
}

async function saveCampaign(campaign: SesCampaign) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        ...campaign,
        PK: sesEmailKeys.campaignPk(campaign.campaignId),
        SK: sesEmailKeys.campaignSk(),
        GSI1PK: sesEmailKeys.entityCampaignPk(),
        GSI1SK: campaign.createdAt,
        GSI2PK: sesEmailKeys.statusPk(campaign.status),
        GSI2SK: campaign.scheduledAt || campaign.updatedAt,
      },
    })
  );
}

export async function getDashboard(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const list = await listCampaignItems();
  const today = dayBucket();
  const scheduledToday = list.filter(
    (c) => c.status === "scheduled" && c.scheduledAt?.startsWith(today)
  ).length;
  const sending = list.filter((c) => c.status === "sending" || c.status === "preparing").length;
  const upcoming = list
    .filter((c) => c.status === "scheduled")
    .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""))
    .slice(0, 8);
  const recent = list
    .filter((c) => c.status === "completed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const scheduledWeek = list.filter(
    (c) => c.status === "scheduled" && c.scheduledAt && new Date(c.scheduledAt).getTime() >= weekStart
  ).length;

  const settings = await loadSettings();
  const daily = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.dailyCounterPk(today), SK: sesEmailKeys.dailyCounterSk() },
    })
  );

  return ok({
    cards: {
      scheduledToday,
      scheduledThisWeek: scheduledWeek,
      currentlySending: sending,
      sentLast24h: Number(daily.Item?.sentCount ?? 0),
      dailyLimit: settings.dailyLimit,
    },
    upcoming,
    recent,
    campaigns: list.slice(0, 20),
  });
}

async function listCampaignItems(): Promise<SesCampaign[]> {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.entityCampaignPk() },
      ScanIndexForward: false,
      Limit: 200,
    })
  );
  return (res.Items ?? []) as SesCampaign[];
}

export async function listCampaigns(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  return ok({ campaigns: await listCampaignItems() });
}

export async function getCampaignHandler(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const id = event.pathParameters?.campaignId;
  if (!id) return badRequest("campaignId required");
  const campaign = await getCampaign(id);
  if (!campaign) return notFound("Campaign not found");

  const recipients = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": sesEmailKeys.campaignPk(id),
        ":sk": "RECIPIENT#",
      },
      Limit: 100,
    })
  );

  return ok({
    campaign,
    recipientsPreview: (recipients.Items ?? []).map((r) => ({
      email: r.email,
      name: r.name,
      company: r.company,
      status: r.status,
    })),
  });
}

export async function createCampaign(event: APIGatewayProxyEventV2) {
  const auth = requireEmailAccess(event);
  if (!auth) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = createSesCampaignSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const settings = await loadSettings();
  const ts = now();
  const campaignId = randomUUID();
  const status = parsed.data.scheduledAt ? "scheduled" : "draft";
  const campaign: SesCampaign = {
    campaignId,
    name: parsed.data.name,
    subject: parsed.data.subject || "",
    senderName: parsed.data.senderName || settings.defaultSenderName,
    senderEmail: parsed.data.senderEmail || settings.defaultSenderEmail,
    replyTo: parsed.data.replyTo || settings.defaultReplyTo,
    htmlBody: parsed.data.htmlBody || "",
    templateId: parsed.data.templateId,
    status,
    scheduledAt: parsed.data.scheduledAt,
    timezone: parsed.data.timezone || "Asia/Kolkata",
    recurrenceType: parsed.data.recurrenceType || "none",
    recurrenceExpression: parsed.data.recurrenceExpression,
    nextRunAt: parsed.data.scheduledAt,
    recipientCount: 0,
    queuedCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    bouncedCount: 0,
    complaintCount: 0,
    openCount: 0,
    clickCount: 0,
    createdBy: auth.email,
    createdAt: ts,
    updatedAt: ts,
  };
  await saveCampaign(campaign);
  await addNotification(`Campaign created: ${campaign.name}`, "info");
  return created({ campaign });
}

export async function updateCampaign(event: APIGatewayProxyEventV2) {
  const auth = requireEmailAccess(event);
  if (!auth) return unauthorized("Email group access required");
  const id = event.pathParameters?.campaignId;
  if (!id) return badRequest("campaignId required");
  const existing = await getCampaign(id);
  if (!existing) return notFound("Campaign not found");

  const body = JSON.parse(event.body ?? "{}");
  const parsed = updateSesCampaignSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const action = parsed.data.action;
  const started = ["preparing", "sending", "completed", "cancelled", "failed"].includes(existing.status);

  if (action === "pause") {
    if (existing.status !== "sending" && existing.status !== "preparing") {
      return badRequest("Only sending campaigns can be paused");
    }
    existing.status = "paused";
  } else if (action === "resume") {
    if (existing.status !== "paused") return badRequest("Only paused campaigns can be resumed");
    existing.status = "sending";
  } else if (action === "cancel") {
    if (["completed", "cancelled"].includes(existing.status)) {
      return badRequest("Campaign already finished");
    }
    existing.status = "cancelled";
  } else if (action === "send_now") {
    if (!["draft", "scheduled", "paused"].includes(existing.status)) {
      return badRequest("Cannot send from current status");
    }
    existing.status = "preparing";
    existing.scheduledAt = undefined;
    existing.nextRunAt = now();
  } else if (action === "duplicate") {
    const ts = now();
    const copy: SesCampaign = {
      ...existing,
      campaignId: randomUUID(),
      name: `${existing.name} (copy)`,
      status: "draft",
      scheduledAt: undefined,
      nextRunAt: undefined,
      lastRunAt: undefined,
      recipientCount: 0,
      queuedCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      bouncedCount: 0,
      complaintCount: 0,
      openCount: 0,
      clickCount: 0,
      createdAt: ts,
      updatedAt: ts,
      createdBy: auth.email,
    };
    await saveCampaign(copy);
    return created({ campaign: copy });
  } else {
    if (started && existing.status !== "draft" && existing.status !== "scheduled") {
      return badRequest("Cannot edit campaign after sending starts");
    }
    Object.assign(existing, {
      name: parsed.data.name ?? existing.name,
      subject: parsed.data.subject ?? existing.subject,
      senderName: parsed.data.senderName ?? existing.senderName,
      senderEmail: parsed.data.senderEmail ?? existing.senderEmail,
      replyTo: parsed.data.replyTo ?? existing.replyTo,
      htmlBody: parsed.data.htmlBody ?? existing.htmlBody,
      templateId: parsed.data.templateId ?? existing.templateId,
      timezone: parsed.data.timezone ?? existing.timezone,
      recurrenceType: parsed.data.recurrenceType ?? existing.recurrenceType,
      recurrenceExpression: parsed.data.recurrenceExpression ?? existing.recurrenceExpression,
    });
    if (parsed.data.scheduledAt) {
      existing.scheduledAt = parsed.data.scheduledAt;
      existing.nextRunAt = parsed.data.scheduledAt;
      existing.status = "scheduled";
    }
    if (parsed.data.status && ["draft", "scheduled"].includes(parsed.data.status)) {
      existing.status = parsed.data.status;
    }
  }

  existing.updatedAt = now();
  await saveCampaign(existing);
  await addNotification(`Campaign ${existing.name}: ${action || "updated"}`, "info");
  return ok({ campaign: existing });
}

export async function uploadRecipients(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = uploadSesRecipientsSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const campaign = await getCampaign(parsed.data.campaignId);
  if (!campaign) return notFound("Campaign not found");
  if (!["draft", "scheduled"].includes(campaign.status)) {
    return badRequest("Recipients can only be uploaded before sending starts");
  }

  const unique = new Map<string, SesRecipient>();
  let skippedInvalid = 0;
  let skippedDuplicate = 0;
  let skippedSuppressed = 0;

  for (const row of parsed.data.recipients) {
    const email = row.email.trim().toLowerCase();
    if (unique.has(email)) {
      skippedDuplicate += 1;
      continue;
    }
    if (await isSuppressed(email)) {
      skippedSuppressed += 1;
      continue;
    }
    unique.set(email, { ...row, email });
  }

  const recipients = [...unique.values()];
  // Batch write in chunks of 25
  for (let i = 0; i < recipients.length; i += 25) {
    const chunk = recipients.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE]: chunk.map((r) => ({
            PutRequest: {
              Item: {
                PK: sesEmailKeys.campaignPk(campaign.campaignId),
                SK: sesEmailKeys.recipientSk(r.email),
                ...r,
                status: "ready",
                createdAt: now(),
              },
            },
          })),
        },
      })
    );
  }

  campaign.recipientCount = recipients.length;
  campaign.updatedAt = now();
  await saveCampaign(campaign);

  return ok({
    imported: recipients.length,
    skippedInvalid,
    skippedDuplicate,
    skippedSuppressed,
    preview: recipients.slice(0, 20),
    campaign,
  });
}

export async function listTemplates(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.entityTemplatePk() },
      ScanIndexForward: false,
      Limit: 100,
    })
  );
  return ok({ templates: res.Items ?? [] });
}

export async function createTemplate(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = createSesTemplateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);
  const ts = now();
  const templateId = randomUUID();
  const item = {
    PK: sesEmailKeys.templatePk(templateId),
    SK: sesEmailKeys.templateSk(),
    GSI1PK: sesEmailKeys.entityTemplatePk(),
    GSI1SK: ts,
    templateId,
    ...parsed.data,
    createdAt: ts,
    updatedAt: ts,
  };
  await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
  return created({ template: item });
}

export async function getSettings(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  return ok({ settings: await loadSettings() });
}

export async function updateSettings(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = sesSettingsSchema.safeParse({ ...(await loadSettings()), ...body });
  if (!parsed.success) return badRequest(parsed.error.message);
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: sesEmailKeys.settingsPk(),
        SK: sesEmailKeys.settingsSk(),
        settings: parsed.data,
        updatedAt: now(),
      },
    })
  );
  return ok({ settings: parsed.data });
}

export async function listSuppression(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.entitySuppressPk() },
      ScanIndexForward: false,
      Limit: 500,
    })
  );
  return ok({ items: res.Items ?? [] });
}

export async function addSuppression(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = suppressEmailSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);
  const ts = now();
  const email = parsed.data.email.trim().toLowerCase();
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: sesEmailKeys.suppressPk(email),
        SK: sesEmailKeys.suppressSk(),
        GSI1PK: sesEmailKeys.entitySuppressPk(),
        GSI1SK: ts,
        email,
        reason: parsed.data.reason,
        createdAt: ts,
      },
    })
  );
  return created({ ok: true, email });
}

export async function removeSuppression(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const email = decodeURIComponent(event.pathParameters?.email ?? "").trim().toLowerCase();
  if (!email) return badRequest("email required");
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.suppressPk(email), SK: sesEmailKeys.suppressSk() },
    })
  );
  return ok({ ok: true });
}

export async function listQueue(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.pendingQueuePk() },
      Limit: 200,
    })
  );
  const campaigns = await listCampaignItems();
  const active = campaigns.filter((c) =>
    ["preparing", "sending", "paused", "scheduled"].includes(c.status)
  );
  return ok({ pending: res.Items ?? [], activeCampaigns: active });
}

export async function getAnalytics(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const campaigns = await listCampaignItems();
  const totals = campaigns.reduce(
    (acc, c) => {
      acc.queued += c.queuedCount;
      acc.sent += c.sentCount;
      acc.delivered += c.deliveredCount;
      acc.failed += c.failedCount;
      acc.bounced += c.bouncedCount;
      acc.complaints += c.complaintCount;
      acc.opens += c.openCount;
      acc.clicks += c.clickCount;
      return acc;
    },
    { queued: 0, sent: 0, delivered: 0, failed: 0, bounced: 0, complaints: 0, opens: 0, clicks: 0 }
  );
  const byDay = campaigns.slice(0, 30).map((c) => ({
    name: c.name,
    sent: c.sentCount,
    opens: c.openCount,
    clicks: c.clickCount,
    failed: c.failedCount,
  }));
  return ok({ totals, byCampaign: byDay, campaigns: campaigns.slice(0, 50) });
}

export async function listNotifications(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.entityNotifyPk() },
      ScanIndexForward: false,
      Limit: 50,
    })
  );
  return ok({ notifications: res.Items ?? [] });
}

export async function sendTest(event: APIGatewayProxyEventV2) {
  if (!requireEmailAccess(event)) return unauthorized("Email group access required");
  const body = JSON.parse(event.body ?? "{}");
  const parsed = sendTestEmailSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);
  const campaign = await getCampaign(parsed.data.campaignId);
  if (!campaign) return notFound("Campaign not found");
  if (!campaign.htmlBody || !campaign.subject) return badRequest("Subject and HTML body required");

  const settings = await loadSettings();
  const openToken = randomUUID().replace(/-/g, "");
  const unsubToken = randomUUID().replace(/-/g, "");
  const linkMap = new Map<string, string>();
  let html = renderSesTemplate(campaign.htmlBody, {
    name: "Test User",
    company: "Test Co",
    email: parsed.data.to,
  });
  html = injectTracking(html, openToken, linkMap);
  html += buildFooter(settings, `${SITE_URL}/email/unsubscribe/${unsubToken}`);

  await sendViaSes({
    to: parsed.data.to,
    subject: `[TEST] ${campaign.subject}`,
    html,
    text: htmlToText(html),
    fromName: campaign.senderName,
    fromEmail: campaign.senderEmail,
    replyTo: campaign.replyTo,
  });

  return ok({ ok: true, message: `Test email sent to ${parsed.data.to}` });
}

/** Public tracking — open pixel */
export async function trackOpen(event: APIGatewayProxyEventV2) {
  const token = event.pathParameters?.token;
  if (!token) return notFound();
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.trackOpenPk(token), SK: sesEmailKeys.trackSk() },
    })
  );
  if (res.Item && !res.Item.openedAt) {
    const ua = event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "";
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: sesEmailKeys.trackOpenPk(token), SK: sesEmailKeys.trackSk() },
        UpdateExpression: "SET openedAt = :t, userAgent = :ua",
        ExpressionAttributeValues: { ":t": now(), ":ua": ua },
      })
    );
    if (res.Item.campaignId) {
      const c = await getCampaign(String(res.Item.campaignId));
      if (c) {
        c.openCount += 1;
        c.updatedAt = now();
        await saveCampaign(c);
      }
    }
  }
  // 1x1 gif
  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
    body: gif.toString("base64"),
    isBase64Encoded: true,
  };
}

/** Public tracking — click redirect */
export async function trackClick(event: APIGatewayProxyEventV2) {
  const token = event.pathParameters?.token;
  if (!token) return notFound();
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.trackClickPk(token), SK: sesEmailKeys.trackSk() },
    })
  );
  const target = (res.Item?.targetUrl as string) || SITE_URL;
  if (res.Item) {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: sesEmailKeys.trackClickPk(token), SK: sesEmailKeys.trackSk() },
        UpdateExpression: "SET clickCount = if_not_exists(clickCount, :z) + :one, lastClickedAt = :t",
        ExpressionAttributeValues: { ":z": 0, ":one": 1, ":t": now() },
      })
    );
    if (res.Item.campaignId) {
      const c = await getCampaign(String(res.Item.campaignId));
      if (c) {
        c.clickCount += 1;
        c.updatedAt = now();
        await saveCampaign(c);
      }
    }
  }
  return {
    statusCode: 302,
    headers: { Location: target, "Access-Control-Allow-Origin": "*" },
    body: "",
  };
}

/** Public unsubscribe */
export async function unsubscribe(event: APIGatewayProxyEventV2) {
  const token = event.pathParameters?.token;
  if (!token) return badRequest("Invalid link");
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.trackOpenPk(token), SK: sesEmailKeys.trackSk() },
    })
  );
  // Also try dedicated unsub tokens stored as TRACKOPEN with type unsubscribe
  const email = (res.Item?.email as string) || "";
  if (email) {
    const ts = now();
    await docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: sesEmailKeys.suppressPk(email),
          SK: sesEmailKeys.suppressSk(),
          GSI1PK: sesEmailKeys.entitySuppressPk(),
          GSI1SK: ts,
          email,
          reason: "unsubscribe",
          createdAt: ts,
        },
      })
    );
  }
  return ok({
    message: email
      ? `${email} has been unsubscribed and will not receive future campaign emails.`
      : "Unsubscribe processed.",
  });
}

/** Cron: promote due scheduled campaigns + send queue batches */
export async function processSesEmailJobs() {
  const settings = await loadSettings();
  const results: Record<string, unknown> = { prepared: 0, sent: 0, failed: 0 };

  // 1) Due scheduled → preparing
  const scheduled = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk AND GSI2SK <= :now",
      ExpressionAttributeValues: {
        ":pk": sesEmailKeys.statusPk("scheduled"),
        ":now": now(),
      },
      Limit: 20,
    })
  );

  for (const item of scheduled.Items ?? []) {
    const campaign = item as SesCampaign;
    campaign.status = "preparing";
    campaign.updatedAt = now();
    await saveCampaign(campaign);
    await enqueueCampaignRecipients(campaign.campaignId);
    campaign.status = "sending";
    campaign.lastRunAt = now();
    campaign.updatedAt = now();
    await saveCampaign(campaign);
    await addNotification(`Campaign started: ${campaign.name}`, "success");
    results.prepared = Number(results.prepared) + 1;
  }

  // Also pick preparing campaigns that need queue built
  const preparing = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.statusPk("preparing") },
      Limit: 10,
    })
  );
  for (const item of preparing.Items ?? []) {
    const campaign = item as SesCampaign;
    await enqueueCampaignRecipients(campaign.campaignId);
    campaign.status = "sending";
    campaign.updatedAt = now();
    await saveCampaign(campaign);
  }

  // 2) Send pending queue respecting rate limits
  const daily = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.dailyCounterPk(dayBucket()), SK: sesEmailKeys.dailyCounterSk() },
    })
  );
  const sentToday = Number(daily.Item?.sentCount ?? 0);
  if (sentToday >= settings.dailyLimit) {
    results.skipped = "daily_limit";
    return results;
  }

  const batchSize = Math.min(settings.batchSize, settings.maxSendRatePerMinute);
  const pending = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.pendingQueuePk() },
      Limit: batchSize,
    })
  );

  for (const item of pending.Items ?? []) {
    const campaignId = String(item.campaignId);
    const email = String(item.email);
    const campaign = await getCampaign(campaignId);
    if (!campaign || campaign.status === "paused" || campaign.status === "cancelled") {
      await deleteQueueItem(campaignId, email);
      continue;
    }
    if (campaign.status !== "sending") continue;
    if (await isSuppressed(email)) {
      await deleteQueueItem(campaignId, email);
      campaign.failedCount += 1;
      await saveCampaign(campaign);
      results.failed = Number(results.failed) + 1;
      continue;
    }

    try {
      await sendQueuedEmail(campaign, item as Record<string, unknown>, settings);
      await deleteQueueItem(campaignId, email);
      campaign.sentCount += 1;
      campaign.deliveredCount += 1;
      campaign.queuedCount = Math.max(0, campaign.queuedCount - 1);
      campaign.updatedAt = now();
      await saveCampaign(campaign);
      await incrementDailySent();
      results.sent = Number(results.sent) + 1;
    } catch (err) {
      const retries = Number(item.retries ?? 0) + 1;
      if (retries >= 3) {
        await deleteQueueItem(campaignId, email);
        campaign.failedCount += 1;
        campaign.queuedCount = Math.max(0, campaign.queuedCount - 1);
        await saveCampaign(campaign);
        results.failed = Number(results.failed) + 1;
      } else {
        await docClient.send(
          new UpdateCommand({
            TableName: TABLE,
            Key: {
              PK: sesEmailKeys.campaignPk(campaignId),
              SK: sesEmailKeys.queueSk(email),
            },
            UpdateExpression: "SET retries = :r, lastError = :e",
            ExpressionAttributeValues: {
              ":r": retries,
              ":e": err instanceof Error ? err.message : String(err),
            },
          })
        );
      }
    }
  }

  // Mark completed when queue empty
  const sending = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": sesEmailKeys.statusPk("sending") },
      Limit: 50,
    })
  );
  for (const item of sending.Items ?? []) {
    const campaign = item as SesCampaign;
    const q = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": sesEmailKeys.campaignPk(campaign.campaignId),
          ":sk": "QUEUE#",
        },
        Limit: 1,
      })
    );
    if ((q.Items ?? []).length === 0 && campaign.queuedCount === 0) {
      campaign.status = "completed";
      campaign.updatedAt = now();
      await saveCampaign(campaign);
      await addNotification(`Campaign completed: ${campaign.name}`, "success");
    }
  }

  return results;
}

async function enqueueCampaignRecipients(campaignId: string) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) return;

  let lastKey: Record<string, unknown> | undefined;
  let queued = 0;
  do {
    const page = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": sesEmailKeys.campaignPk(campaignId),
          ":sk": "RECIPIENT#",
        },
        ExclusiveStartKey: lastKey,
        Limit: 100,
      })
    );
      for (const r of page.Items ?? []) {
      const email = String(r.email).toLowerCase();
      if (await isSuppressed(email)) continue;
      try {
        await docClient.send(
          new PutCommand({
            TableName: TABLE,
            Item: {
              PK: sesEmailKeys.campaignPk(campaignId),
              SK: sesEmailKeys.queueSk(email),
              GSI1PK: sesEmailKeys.pendingQueuePk(),
              GSI1SK: sesEmailKeys.pendingQueueSk(campaignId, email),
              campaignId,
              email,
              name: r.name,
              company: r.company,
              city: r.city,
              state: r.state,
              country: r.country,
              status: "pending",
              retries: 0,
              createdAt: now(),
            },
            ConditionExpression: "attribute_not_exists(PK)",
          })
        );
        queued += 1;
      } catch {
        // already queued — skip duplicate
      }
    }
    lastKey = page.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  campaign.queuedCount = queued;
  campaign.updatedAt = now();
  await saveCampaign(campaign);
}

async function deleteQueueItem(campaignId: string, email: string) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        PK: sesEmailKeys.campaignPk(campaignId),
        SK: sesEmailKeys.queueSk(email),
      },
    })
  );
}

async function incrementDailySent() {
  const day = dayBucket();
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: sesEmailKeys.dailyCounterPk(day), SK: sesEmailKeys.dailyCounterSk() },
      UpdateExpression: "SET sentCount = if_not_exists(sentCount, :z) + :one, updatedAt = :t",
      ExpressionAttributeValues: { ":z": 0, ":one": 1, ":t": now() },
    })
  );
}

async function sendQueuedEmail(
  campaign: SesCampaign,
  recipient: Record<string, unknown>,
  settings: SesSettings
) {
  const email = String(recipient.email);
  const openToken = randomUUID().replace(/-/g, "");
  const unsubToken = randomUUID().replace(/-/g, "");
  const linkMap = new Map<string, string>();

  let html = renderSesTemplate(campaign.htmlBody, {
    name: recipient.name as string | undefined,
    company: recipient.company as string | undefined,
    email,
  });
  html = injectTracking(html, openToken, linkMap);
  html += buildFooter(settings, `${SITE_URL}/email/unsubscribe/${unsubToken}`);

  // Store open + unsub token (reuse open record for unsub lookup by storing email)
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: sesEmailKeys.trackOpenPk(openToken),
        SK: sesEmailKeys.trackSk(),
        campaignId: campaign.campaignId,
        email,
        type: "open",
        createdAt: now(),
      },
    })
  );
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: sesEmailKeys.trackOpenPk(unsubToken),
        SK: sesEmailKeys.trackSk(),
        campaignId: campaign.campaignId,
        email,
        type: "unsubscribe",
        createdAt: now(),
      },
    })
  );

  for (const [token, targetUrl] of linkMap) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: sesEmailKeys.trackClickPk(token),
          SK: sesEmailKeys.trackSk(),
          campaignId: campaign.campaignId,
          email,
          targetUrl,
          clickCount: 0,
          createdAt: now(),
        },
      })
    );
  }

  await sendViaSes({
    to: email,
    subject: campaign.subject,
    html,
    text: htmlToText(html),
    fromName: campaign.senderName,
    fromEmail: campaign.senderEmail,
    replyTo: campaign.replyTo,
  });
}

// silence unused import warning for ScanCommand / forbidden / getAuth in some builds
void ScanCommand;
void forbidden;
void getAuth;
