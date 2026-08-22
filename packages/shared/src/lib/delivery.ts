/** US delivery estimate: ~6 business days from today. */
export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  return date;
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function estimatedDeliveryRange(from = new Date()): { start: Date; end: Date } {
  return {
    start: addBusinessDays(from, 5),
    end: addBusinessDays(from, 6),
  };
}

export function estimatedDeliveryLabel(from = new Date()): string {
  const { start, end } = estimatedDeliveryRange(from);
  return `Arrives ${formatDeliveryDate(start)} – ${formatDeliveryDate(end)} (about 6 business days, USA)`;
}

export function estimatedDeliveryShort(from = new Date()): string {
  const { start, end } = estimatedDeliveryRange(from);
  return `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;
}
