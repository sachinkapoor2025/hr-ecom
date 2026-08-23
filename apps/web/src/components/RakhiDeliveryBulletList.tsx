type Props = {
  items: readonly string[];
  className?: string;
  /** Highlight the first item (order-by deadline). */
  highlightFirst?: boolean;
};

/** Styled bullet list for shipping options. */
export function RakhiDeliveryBulletList({
  items,
  className = "",
  highlightFirst = false,
}: Props) {
  return (
    <ul className={`mt-2 space-y-1.5 list-none ${className}`}>
      {items.map((item, index) => (
        <li key={item} className="flex gap-2.5 text-sm text-slate-800 leading-snug">
          <span
            className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-nav"
            aria-hidden
          />
          <span
            className={
              highlightFirst && index === 0 ? "font-semibold text-primary" : "font-medium"
            }
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
