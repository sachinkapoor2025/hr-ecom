"use client";

import { RakhiDeliverySummary } from "@/components/RakhiDeliverySummary";
import {
  LastMinuteDeliveryTemplate,
  type LastMinuteDeliveryTemplateProps,
} from "@/components/LastMinuteDeliveryTemplate";

/** Cart + checkout last-minute speed picker — one shared template. */
export function ExpeditedShippingPicker(props: LastMinuteDeliveryTemplateProps) {
  return <LastMinuteDeliveryTemplate {...props} />;
}

/** @deprecated Use RakhiDeliverySummary — one block, standard and expedited separated. */
export function RakhiWeekendShippingBanner(props: { className?: string }) {
  return <RakhiDeliverySummary {...props} />;
}
