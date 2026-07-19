"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiClient, useAuth } from "@/lib/auth-context";
import { ADMIN_COUPON_DISCOUNT_OPTIONS, type StoreCoupon } from "@hr-ecom/shared";
import { PhoneInput, buildPhoneValue } from "@/components/PhoneInput";

type CreateResult = {
  coupon: StoreCoupon & { phone?: string; createdBy?: string };
  emails: {
    customerOk: boolean;
    notifyOk: boolean;
    customerError?: string;
    notifyError?: string;
  };
  whatsapp: {
    sent: boolean;
    skipped?: boolean;
    provider?: string;
    deepLink: string;
    error?: string;
  };
};

export default function AdminCouponsPage() {
  const api = useApiClient();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastWhatsAppLink, setLastWhatsAppLink] = useState("");
  const [lastCode, setLastCode] = useState("");
  const [rows, setRows] = useState<StoreCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ coupons: StoreCoupon[] }>("/admin/coupons/abandoned");
      setRows(res.coupons ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasEmail = Boolean(email.trim() && email.includes("@"));
    const mobileDigits = phoneLocal.replace(/\D/g, "");
    const hasPhone = mobileDigits.length >= 7;
    if (!hasEmail && !hasPhone) {
      setError("Enter a customer email or mobile number");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setLastWhatsAppLink("");
    setLastCode("");
    try {
      const res = await api<CreateResult>("/admin/coupons/abandoned", {
        method: "POST",
        body: JSON.stringify({
          ...(hasEmail ? { email: email.trim() } : {}),
          // Coupon match uses mobile only; country code is for WhatsApp send.
          ...(hasPhone
            ? {
                phone: mobileDigits,
                whatsappPhone: buildPhoneValue(phoneCountry, phoneLocal),
              }
            : {}),
          discountPercent,
        }),
      });
      setLastCode(res.coupon.code);
      setLastWhatsAppLink(res.whatsapp.deepLink);
      const emailNotes = hasEmail
        ? [
            res.emails.customerOk
              ? "customer emailed"
              : `customer email failed${res.emails.customerError ? `: ${res.emails.customerError}` : ""}`,
            res.emails.notifyOk
              ? "team notified"
              : `notify failed${res.emails.notifyError ? `: ${res.emails.notifyError}` : ""}`,
          ].join(" · ")
        : [
            "no customer email (phone-only)",
            res.emails.notifyOk
              ? "team notified"
              : `notify failed${res.emails.notifyError ? `: ${res.emails.notifyError}` : ""}`,
          ].join(" · ");
      const waNote = !hasPhone
        ? "WhatsApp skipped (no phone)"
        : res.whatsapp.sent
          ? `WhatsApp sent via ${res.whatsapp.provider}`
          : res.whatsapp.skipped
            ? "WhatsApp API not configured — use Open WhatsApp below"
            : `WhatsApp failed${res.whatsapp.error ? `: ${res.whatsapp.error}` : ""}`;
      setMessage(
        `Coupon ${res.coupon.code} created (${res.coupon.discountPercent}% · expires in 1 hour). ${emailNotes}. ${waNote}.`
      );
      setEmail("");
      setPhoneLocal("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Abandoned cart coupons</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate a 1-hour coupon for outreach. Provide email, phone, or both — checkout matches
          the mobile number only (country code is ignored). Team notifications go to
          order@mydgv.com, priya.yadav@mydgv.com, and you ({user?.email ?? "logged-in admin"}).
        </p>
      </div>

      <form onSubmit={generate} className="bg-white border rounded-xl p-5 space-y-4">
        <label className="block text-sm">
          Email <span className="text-slate-400 font-normal">(optional if phone is set)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@email.com"
            className="mt-1 w-full border rounded-lg px-3 py-2"
          />
        </label>

        <div>
          <PhoneInput
            label="Phone number (WhatsApp)"
            countryIso={phoneCountry}
            localNumber={phoneLocal}
            onCountryChange={setPhoneCountry}
            onLocalNumberChange={setPhoneLocal}
            compact
            placeholder="Mobile number"
            className="text-sm"
            selectClassName="mt-1"
            inputClassName="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">
            Optional if email is set. Country code is for WhatsApp only — coupon validation uses the
            mobile number.
          </p>
        </div>

        <label className="block text-sm">
          Discount
          <select
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="mt-1 w-full border rounded-lg px-3 py-2"
          >
            {ADMIN_COUPON_DISCOUNT_OPTIONS.map((pct) => (
              <option key={pct} value={pct}>
                {pct}% off
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-nav text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Generating…" : "Generate coupon"}
        </button>
      </form>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {lastCode && (
        <div className="rounded-xl border border-nav/30 bg-blue-50 px-4 py-3 text-sm space-y-2">
          <p>
            Latest code: <strong className="font-mono text-base">{lastCode}</strong>
          </p>
          {lastWhatsAppLink && (
            <a
              href={lastWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-nav font-medium hover:underline"
            >
              Open WhatsApp with coupon message →
            </a>
          )}
        </div>
      )}

      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Recent admin coupons</div>
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No admin coupons yet.</p>
        ) : (
          <ul className="divide-y text-sm max-h-96 overflow-y-auto">
            {rows.slice(0, 50).map((c) => {
              const expired = new Date(c.expiresAt).getTime() < Date.now();
              const used = Boolean(c.usedAt);
              const phoneVal =
                "phone" in c && typeof (c as { phone?: string }).phone === "string"
                  ? (c as { phone?: string }).phone
                  : "";
              return (
                <li key={c.code} className="px-4 py-3 flex flex-wrap gap-2 justify-between">
                  <div>
                    <p className="font-mono font-medium">{c.code}</p>
                    <p className="text-xs text-slate-500">
                      {[
                        c.email || null,
                        phoneVal || null,
                        `${c.discountPercent}%`,
                        `by ${(c as { createdBy?: string }).createdBy ?? "—"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-xs text-right text-slate-500">
                    <p>{used ? "Used" : expired ? "Expired" : "Active"}</p>
                    <p>exp {new Date(c.expiresAt).toLocaleString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
