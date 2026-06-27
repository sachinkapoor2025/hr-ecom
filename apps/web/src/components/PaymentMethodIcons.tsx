/** Accepted payment method badges for footer / checkout trust signals. */
export function PaymentMethodIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Accepted payment methods">
      <span className="inline-flex h-8 min-w-[3rem] items-center justify-center rounded border border-slate-200 bg-white px-2 text-[10px] font-bold tracking-wide text-[#1A1F71]">
        VISA
      </span>
      <span className="inline-flex h-8 min-w-[3rem] items-center justify-center rounded border border-slate-200 bg-white px-2">
        <svg viewBox="0 0 48 32" className="h-5 w-8" aria-label="Mastercard">
          <circle cx="18" cy="16" r="10" fill="#EB001B" />
          <circle cx="30" cy="16" r="10" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      </span>
      <span className="inline-flex h-8 min-w-[3rem] items-center justify-center rounded border border-slate-200 bg-white px-2 text-[10px] font-bold text-[#006FCF]">
        AMEX
      </span>
      <span className="inline-flex h-8 min-w-[3rem] items-center justify-center rounded border border-slate-200 bg-white px-2 text-[10px] font-bold text-[#097969]">
        RuPay
      </span>
    </div>
  );
}
