import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Welcome to HR Shop
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Full-featured e-commerce with smart customer outreach, dual payment gateways, and
          AI-powered development workflow.
        </p>
        <Link
          href="/products"
          className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Browse Products
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Secure Payments", desc: "Stripe (USA) & Razorpay (India)" },
          { title: "Smart Outreach", desc: "We capture partial info to help you sell more" },
          { title: "SEO Optimized", desc: "Built for search engines from day one" },
        ].map((f) => (
          <div key={f.title} className="border border-slate-200 rounded-xl p-6 bg-white">
            <h2 className="font-semibold text-lg mb-2">{f.title}</h2>
            <p className="text-slate-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
