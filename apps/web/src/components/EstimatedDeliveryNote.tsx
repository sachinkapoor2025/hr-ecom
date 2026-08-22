import {
  RAKHI_DELIVERY_URGENCY_NOTICE,
  RAKHI_ON_TIME_DELIVERY_SUCCESS_PERCENT,
  estimatedDeliveryRange,
  formatDeliveryDate,
} from "@hr-ecom/shared";
import { RakhiDeliveryBulletList } from "@/components/RakhiDeliveryBulletList";

interface Props {
  variant?: "inline" | "banner";
  prefix?: string;
  className?: string;
}

/** Estimated US delivery window with Rakhi-day odds callout. */
export function EstimatedDeliveryNote({
  variant = "inline",
  prefix = "Estimated delivery:",
  className = "",
}: Props) {
  const { start, end } = estimatedDeliveryRange();
  const windowLabel = `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;
  const notice = RAKHI_DELIVERY_URGENCY_NOTICE;
  const rakhiBullets = [
    `~${RAKHI_ON_TIME_DELIVERY_SUCCESS_PERCENT}% chance of Rakhi-day delivery (${notice.festivalShort}) with standard shipping when you order by ${notice.orderByShort}`,
    "We'll try our best to reach your brother on festival day",
    `${notice.confirmedExpeditedLabel} — choose 3-day or 2-day at checkout`,
  ] as const;

  if (variant === "banner") {
    return (
      <div
        className={`rounded-lg border border-orange-100 bg-orange-50/80 px-3.5 py-3 text-sm text-slate-700 ${className}`}
      >
        <div className="flex gap-2.5">
          <svg
            className="w-5 h-5 shrink-0 text-nav mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0m-4 0V9m0 0H5.5M12 9h6.5M12 9L9 5m3 4l3-4"
            />
          </svg>
          <div className="min-w-0 flex-1 space-y-2.5">
            <p className="leading-snug">
              <span className="font-semibold text-primary">{prefix}</span>{" "}
              <span className="font-medium text-slate-900">Arrives {windowLabel}</span>
              <span className="text-slate-600"> (about 6 business days, USA)</span>
            </p>
            <div className="rounded-md border border-emerald-100 bg-emerald-50/70 px-2.5 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                Standard shipping · Rakhi day
              </p>
              <RakhiDeliveryBulletList items={rakhiBullets} className="mt-1.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-xs sm:text-sm text-slate-600 ${className}`}>
      <span className="font-medium text-slate-700">{prefix}</span> Arrives {windowLabel} (about 6
      business days, USA)
    </p>
  );
}
