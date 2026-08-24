"use client";

import {
  MAX_PRODUCT_ADDON_QUANTITY,
  MAX_RAKHI_ADDON_PIECES,
  PRODUCT_ADDONS,
  RAKHI_ADDON_BUNDLE_USD,
  addonMaxQuantity,
  addonsForProductPage,
  selectedAddonsUsdTotal,
  type ProductAddonDef,
  type ProductAddonSelection,
} from "@hr-ecom/shared";
import { useCurrency } from "@/lib/currency-context";
import { resolveImageUrl } from "@/lib/images";

function qtyMap(selected: ProductAddonSelection[]): Map<string, number> {
  return new Map(selected.map((s) => [s.id, s.quantity]));
}

function AddonGroup({
  title,
  items,
  quantities,
  onToggle,
  onSetQuantity,
}: {
  title: string;
  items: readonly ProductAddonDef[];
  quantities: Map<string, number>;
  onToggle: (id: string) => void;
  onSetQuantity: (id: string, quantity: number) => void;
}) {
  const { format } = useCurrency();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((addon) => {
          const qty = quantities.get(addon.id) ?? 0;
          const checked = qty > 0;
          const linePrice = addon.priceUsd * Math.max(qty, 1);
          return (
            <li key={addon.id}>
              <div
                className={`rounded-lg border px-3 py-2.5 transition ${
                  checked
                    ? "border-nav bg-blue-50/60 ring-1 ring-nav/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-nav focus:ring-nav"
                    checked={checked}
                    onChange={() => onToggle(addon.id)}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{addon.name}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{addon.detail}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-primary tabular-nums">
                    +{format(checked ? linePrice : addon.priceUsd, "USD")}
                  </span>
                </label>
                {checked ? (
                  <div className="mt-2 ml-7 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Qty</span>
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        aria-label={`Decrease ${addon.name}`}
                        className="flex h-8 w-8 items-center justify-center text-slate-700 hover:bg-slate-50 rounded-l-full disabled:opacity-40"
                        disabled={qty <= 1}
                        onClick={() => onSetQuantity(addon.id, qty - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${addon.name}`}
                        className="flex h-8 w-8 items-center justify-center text-slate-700 hover:bg-slate-50 rounded-r-full disabled:opacity-40"
                        disabled={qty >= MAX_PRODUCT_ADDON_QUANTITY}
                        onClick={() => onSetQuantity(addon.id, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    {qty > 1 ? (
                      <span className="text-xs text-slate-500">
                        {format(addon.priceUsd, "USD")} each
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RakhiAddonStrip({
  items,
  quantities,
  selected,
  rakhiPieces,
  remaining,
  onToggle,
  onSetQuantity,
}: {
  items: readonly ProductAddonDef[];
  quantities: Map<string, number>;
  selected: ProductAddonSelection[];
  rakhiPieces: number;
  remaining: number;
  onToggle: (id: string) => void;
  onSetQuantity: (id: string, quantity: number) => void;
}) {
  const { format } = useCurrency();
  const mixTotal = selectedAddonsUsdTotal(selected.filter((s) => items.some((i) => i.id === s.id)));
  const bundlePrices = [1, 2, 3, 4, 5] as const;

  return (
    <div>
      <div className="mb-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm sm:text-base font-bold text-primary">Extra rakhis — mix any 1 to 5</p>
          {rakhiPieces > 0 ? (
            <p className="text-sm font-bold text-nav tabular-nums">
              {rakhiPieces} extra · {format(mixTotal, "USD")}
            </p>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm sm:text-[15px] font-semibold text-slate-800 leading-relaxed">
          {bundlePrices.map((count, i) => (
            <span key={count}>
              {i > 0 ? " · " : ""}
              {count} for {format(RAKHI_ADDON_BUNDLE_USD[count], "USD")}
            </span>
          ))}
        </p>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {items.map((addon) => {
          const qty = quantities.get(addon.id) ?? 0;
          const checked = qty > 0;
          const image = addon.image ? resolveImageUrl(addon.image) : "";
          const canAdd = remaining > 0 || checked;
          return (
            <li key={addon.id}>
              <div
                className={`group rounded-lg border bg-white flex flex-col overflow-hidden transition ${
                  checked ? "border-nav ring-1 ring-nav/30" : "border-slate-200 hover:border-nav/40 hover:shadow-sm"
                } ${!canAdd ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => canAdd && onToggle(addon.id)}
                  className="text-left w-full"
                  aria-pressed={checked}
                  aria-label={addon.name}
                >
                  <span className="relative block w-full aspect-square bg-slate-100 overflow-hidden">
                    {image ? (
                      // Native img: next/image fill collapses to 0px inside a shrink-wrapped button.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    ) : null}
                    {checked ? (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-nav text-white text-[10px] font-bold px-1.5 py-0.5 z-[1]">
                        {qty}
                      </span>
                    ) : null}
                  </span>
                  <span className="block px-1.5 pt-1.5 pb-1">
                    <span className="block text-[11px] font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.1rem]">
                      {addon.name}
                    </span>
                  </span>
                </button>
                {checked ? (
                  <div className="mt-auto px-1.5 pb-2 flex items-center justify-center">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        aria-label={`Decrease ${addon.name}`}
                        className="flex h-7 w-7 items-center justify-center text-slate-700 hover:bg-slate-50 rounded-l-full"
                        onClick={() => onSetQuantity(addon.id, qty - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${addon.name}`}
                        className="flex h-7 w-7 items-center justify-center text-slate-700 hover:bg-slate-50 rounded-r-full disabled:opacity-40"
                        disabled={remaining <= 0}
                        onClick={() => onSetQuantity(addon.id, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto px-1.5 pb-2">
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => onToggle(addon.id)}
                      className="w-full rounded-md bg-nav px-2 py-1.5 text-xs font-bold text-white hover:bg-primary transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** UsaRakhi-only extra rakhi & chocolate add-ons (multi-select with quantity). */
export function ProductAddonsPicker({
  selected,
  onChange,
  productSlug,
  className = "",
}: {
  selected: ProductAddonSelection[];
  onChange: (next: ProductAddonSelection[]) => void;
  /** Current PDP slug — hides that rakhi from the extra-rakhi mix. */
  productSlug?: string;
  className?: string;
}) {
  const { format } = useCurrency();
  const catalog = productSlug ? addonsForProductPage(productSlug) : PRODUCT_ADDONS;
  const rakhis = catalog.filter((a) => a.group === "rakhis");
  const dryFruits = catalog.filter((a) => a.group === "dry-fruits");
  const chocolates = catalog.filter((a) => a.group === "chocolates");
  const quantities = qtyMap(selected);
  const rakhiPieces = selected.reduce((sum, s) => {
    const def = catalog.find((a) => a.id === s.id) ?? PRODUCT_ADDONS.find((a) => a.id === s.id);
    return def?.group === "rakhis" ? sum + s.quantity : sum;
  }, 0);
  const remaining = MAX_RAKHI_ADDON_PIECES - rakhiPieces;
  const addonsTotal = selectedAddonsUsdTotal(selected);

  const addonDef = (id: string) =>
    catalog.find((a) => a.id === id) ?? PRODUCT_ADDONS.find((a) => a.id === id);

  const toggle = (id: string) => {
    if (quantities.has(id)) {
      onChange(selected.filter((s) => s.id !== id));
      return;
    }
    if (addonDef(id)?.group === "rakhis" && remaining <= 0) return;
    onChange([...selected, { id, quantity: 1 }].sort((a, b) => a.id.localeCompare(b.id)));
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      onChange(selected.filter((s) => s.id !== id));
      return;
    }
    const current = quantities.get(id) ?? 0;
    const stockCap = addonMaxQuantity(id);
    const maxForThis =
      addonDef(id)?.group === "rakhis"
        ? current + remaining
        : Math.min(MAX_PRODUCT_ADDON_QUANTITY, stockCap);
    const nextQty = Math.min(MAX_PRODUCT_ADDON_QUANTITY, maxForThis, quantity);
    if (nextQty < 1) {
      onChange(selected.filter((s) => s.id !== id));
      return;
    }
    const exists = selected.some((s) => s.id === id);
    const next = exists
      ? selected.map((s) => (s.id === id ? { ...s, quantity: nextQty } : s))
      : [...selected, { id, quantity: nextQty }];
    onChange(next.sort((a, b) => a.id.localeCompare(b.id)));
  };

  return (
    <div className={`rounded-xl border border-nav/20 bg-gradient-to-br from-[#eef3ff] via-white to-amber-50/50 px-3 py-4 sm:px-4 sm:py-5 ${className}`}>
      <div className="mb-4">
        <p className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">Add extras</p>
        <p className="text-sm sm:text-[15px] text-slate-700 mt-1.5 leading-relaxed">
          Mix extra designer rakhis at bundle prices, add chocolates, or add a small pack of dry
          fruits while supplies last. Rakhi product pages stay at the regular price.
        </p>
      </div>
      <div className="space-y-4">
        {rakhis.length > 0 ? (
          <RakhiAddonStrip
            items={rakhis}
            quantities={quantities}
            selected={selected}
            rakhiPieces={rakhiPieces}
            remaining={remaining}
            onToggle={toggle}
            onSetQuantity={setQuantity}
          />
        ) : null}
        {dryFruits.length > 0 ? (
          <AddonGroup
            title="Dry fruits"
            items={dryFruits}
            quantities={quantities}
            onToggle={toggle}
            onSetQuantity={setQuantity}
          />
        ) : null}
        {chocolates.length > 0 ? (
          <AddonGroup
            title="Chocolates"
            items={chocolates}
            quantities={quantities}
            onToggle={toggle}
            onSetQuantity={setQuantity}
          />
        ) : null}
      </div>
      {addonsTotal > 0 ? (
        <p className="mt-3 pt-3 border-t border-slate-200 text-sm font-semibold text-slate-800 flex justify-between gap-3">
          <span>Add-ons total</span>
          <span className="text-primary tabular-nums">+{format(addonsTotal, "USD")}</span>
        </p>
      ) : null}
    </div>
  );
}
