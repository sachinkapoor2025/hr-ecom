type Props = {
  items: readonly string[];
  className?: string;
  /** Highlight the first item (order-by deadline). */
  highlightFirst?: boolean;
};

/** Styled bullet list for Rakhi delivery urgency copy. */
export function RakhiDeliveryBulletList({
  items,
  className = "",
  highlightFirst = false,
}: Props) {
  return (
    <ul className={`mt-2 space-y-1.5 ${className}`}>
      {items.map((item, index) => (
        <li key={item} className="flex gap-2 text-xs sm:text-sm text-slate-700 leading-snug">
          <span
            className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-nav"
            aria-hidden
          />
          <span
            className={
              highlightFirst && index === 0 ? "font-semibold text-primary" : undefined
            }
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
