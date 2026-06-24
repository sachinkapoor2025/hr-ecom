import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
      <p className="text-slate-600 mb-8">
        Manage your store. Developers: open this repo in Cursor and prompt changes — no manual code edits needed.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/products", title: "Products", desc: "Add, edit, bulk upload" },
          { href: "/admin/categories", title: "Categories", desc: "Organize catalog" },
          { href: "/admin/orders", title: "Orders", desc: "View and fulfill orders" },
          { href: "/admin/leads", title: "Customer Leads", desc: "Partial captures for outreach" },
          { href: "/admin/payments", title: "Payment Config", desc: "Stripe / Razorpay regions" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition bg-white"
          >
            <h2 className="font-semibold text-lg">{item.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
