"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget").then((m) => m.ChatWidget), {
  ssr: false,
  loading: () => null,
});

/**
 * Client-only widgets loaded after hydration (reduces initial JS).
 * Spin-the-wheel (`ExitIntentPopup`) is on hold — do not remount until marketing asks.
 */
export function ClientDeferredWidgets() {
  return (
    <>
      <ChatWidget />
    </>
  );
}
