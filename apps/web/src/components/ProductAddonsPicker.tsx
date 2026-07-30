"use client";

import { PRODUCT_ADDONS, type ProductAddonDef } from "@hr-ecom/shared";
import { useCurrency } from "@/lib/currency-context";

const DRY_FRUITS = PRODUCT_ADDONS.filter((a) => a.group === "dry-fruits");
const CHOCOLATES = PRODUCT_ADDONS.filter((a) => a.group === "chocolates");

function AddonGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: readonly ProductAddonDef[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { format } = useCurrency();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((addon) => {
          const checked = selected.has(addon.id);
          return (
            <li key={addon.id}>
              <label
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                  checked
                    ? "border-nav bg-blue-50/60 ring-1 ring-nav/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
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
                <span className="shrink-0 text-sm font-bold text-primary">
                  +{format(addon.priceUsd, "USD")}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** UsaRakhi-only dry fruit & chocolate add-ons (multi-select). */
export function ProductAddonsPicker({
  selectedIds,
  onChange,
  className = "",
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}) {
  const selected = new Set(selectedIds);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 sm:px-4 sm:py-4 ${className}`}>
      <div className="mb-3">
        <p className="text-sm font-bold text-primary">Add something sweet</p>
        <p className="text-xs text-slate-600 mt-0.5">
          Optional dry fruits &amp; chocolates — added to this Rakhi order.
        </p>
      </div>
      <div className="space-y-4">
        <AddonGroup title="Dry fruits" items={DRY_FRUITS} selected={selected} onToggle={toggle} />
        <AddonGroup title="Chocolates" items={CHOCOLATES} selected={selected} onToggle={toggle} />
      </div>
    </div>
  );
}
