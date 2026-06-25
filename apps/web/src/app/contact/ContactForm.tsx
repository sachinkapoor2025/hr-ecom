"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { useSessionId } from "@/lib/session";
import { api } from "@/lib/api";

export function ContactForm() {
  const sessionId = useSessionId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const sid = sessionId;
      if (!sid) throw new Error("Session not ready");
      await api("/leads", {
        method: "POST",
        sessionId: sid,
        body: JSON.stringify({
          sessionId: sid,
          name,
          email,
          page: "/contact",
          source: "contact",
          metadata: { message },
        }),
      });
      setSubmittedEmail(email);
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Contact Us</h1>
      <p className="text-slate-600 mb-8">
        Have questions about your Rakhi order or delivery to the USA? Our team is here to help you before, during, and
        after Raksha Bandhan.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-primary mb-2">Email</h2>
          <a href={`mailto:${site.supportEmail}`} className="text-nav hover:underline">
            {site.supportEmail}
          </a>
        </div>
        <div className="border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-primary mb-2">Delivery</h2>
          <p className="text-slate-600 text-sm">5–7 business days across all 50 US states. Same-day dispatch on most orders.</p>
        </div>
      </div>

      {sent ? (
        <div className="border border-green-200 bg-green-50 rounded-xl p-6 text-green-800">
          <p className="font-semibold mb-2">Message sent!</p>
          <p className="text-sm">We&apos;ll get back to you at {submittedEmail} as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 border border-slate-200 rounded-xl p-6 bg-slate-50">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="How can we help?"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-cart px-8 disabled:opacity-50">
            {loading ? "Sending..." : "Send Message"}
          </button>
          <p className="text-xs text-slate-500">
            For order tracking, use your confirmation email or visit{" "}
            <Link href="/account" className="text-nav hover:underline">
              My Account
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  );
}
