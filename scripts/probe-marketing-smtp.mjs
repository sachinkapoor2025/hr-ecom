import nodemailer from "nodemailer";

const pass = process.env.MARKETING_SMTP_PASS?.trim() || "";
if (!pass) {
  console.error("MARKETING_SMTP_PASS is empty");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp-prod.mailrcld.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: "order@usarakhi.com", pass },
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 30_000,
});

const info = await transporter.sendMail({
  from: { name: "UsaRakhi", address: "email@usarakhi.com" },
  to: "order@usarakhi.com",
  subject: "[TEST] Marketing email SMTP check",
  text: "This message confirms the admin marketing email SMTP login can deliver mail.",
});

const accepted = Array.isArray(info.accepted) ? info.accepted.join(",") : "";
const messageId = typeof info.messageId === "string" ? info.messageId : "";
console.log(`::warning::Marketing SMTP accepted by ${accepted} messageId=${messageId}`);
