import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-slate-600">
        <div>
          <p className="font-bold text-slate-900 mb-2">HR Shop</p>
          <p>Premium e-commerce with secure payments and smart customer outreach.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-2">Shop</p>
          <ul className="space-y-1">
            <li><Link href="/products" className="hover:text-accent">All Products</Link></li>
            <li><Link href="/cart" className="hover:text-accent">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-accent">Checkout</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-2">Support</p>
          <ul className="space-y-1">
            <li><Link href="/account" className="hover:text-accent">Account</Link></li>
            <li><a href="mailto:support@hrshop.com" className="hover:text-accent">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} HR Shop. All rights reserved.
      </div>
    </footer>
  );
}
