import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${site.name} for Rakhi delivery support and order help.`,
};

export default function ContactPage() {
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
      <form className="space-y-4 border border-slate-200 rounded-xl p-6 bg-slate-50">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="you@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="How can we help?" />
        </div>
        <button type="button" className="btn-cart px-8">
          Send Message
        </button>
        <p className="text-xs text-slate-500">
          For order tracking, use your confirmation email or visit{" "}
          <Link href="/account" className="text-nav hover:underline">
            My Account
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
