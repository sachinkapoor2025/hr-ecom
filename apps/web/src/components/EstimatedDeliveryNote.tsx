import { estimatedDeliveryRange, formatDeliveryDate } from "@hr-ecom/shared";

interface Props {
  variant?: "inline" | "banner";
  prefix?: string;
  className?: string;
}

/** Plain delivery window only — use RakhiDeliverySummary for Rakhi standard vs expedited copy. */
export function EstimatedDeliveryNote({
  variant = "inline",
  prefix = "Estimated delivery:",
  className = "",
}: Props) {
  const { start, end } = estimatedDeliveryRange();
  const windowLabel = `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;

  if (variant === "banner") {
    return (
      <div
        className={`rounded-lg border border-orange-100 bg-orange-50/80 px-3.5 py-3 text-sm text-slate-700 ${className}`}
      >
        <span className="font-semibold text-primary">{prefix}</span>{" "}
        <span className="font-medium text-slate-900">Arrives {windowLabel}</span>
        <span className="text-slate-600"> (about 6 business days, USA)</span>
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
