"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { api } from "./api";

const SESSION_KEY = "hr_ecom_session";

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}

export function useLeadCapture(sessionId: string) {
  return useCallback(
    async (fields: {
      name?: string;
      email?: string;
      phone?: string;
      page?: string;
      productSlug?: string;
      source?: "checkout" | "newsletter" | "product" | "browse" | "admin";
    }) => {
      if (!sessionId) return;
      try {
        await api("/leads", {
          method: "POST",
          sessionId,
          body: JSON.stringify({ sessionId, ...fields }),
        });
      } catch {
        /* silent — lead capture should not block UX */
      }
    },
    [sessionId]
  );
}

export function useDebouncedLeadCapture(sessionId: string, delay = 800) {
  const capture = useLeadCapture(sessionId);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (fields: Parameters<typeof capture>[0]) => {
      if (timer) clearTimeout(timer);
      const t = setTimeout(() => capture(fields), delay);
      setTimer(t);
    },
    [capture, delay, timer]
  );
}
