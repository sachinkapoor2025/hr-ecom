"use client";

import { useMemo, useState } from "react";
import { previewSesTemplateHtml } from "@hr-ecom/shared";

type PreviewMode = "desktop" | "mobile" | "both";

/**
 * Desktop + mobile iframe preview for marketing email HTML.
 * Merge tags are filled with preview defaults (does not send).
 */
export function EmailTemplatePreview({ html }: { html: string }) {
  const [mode, setMode] = useState<PreviewMode>("both");
  const preview = useMemo(() => previewSesTemplateHtml(html), [html]);

  return (
    <div className="rounded-xl border overflow-hidden bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b bg-white">
        <p className="text-xs font-medium text-slate-600">Email preview</p>
        <div className="flex gap-1">
          {(
            [
              ["desktop", "Desktop"],
              ["mobile", "Mobile"],
              ["both", "Both"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                mode === id ? "bg-nav text-white" : "border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-4 p-3 overflow-x-auto">
        {(mode === "desktop" || mode === "both") && (
          <PreviewFrame title="Desktop · 600px" width={600} html={preview} />
        )}
        {(mode === "mobile" || mode === "both") && (
          <PreviewFrame title="Mobile · 375px" width={375} html={preview} />
        )}
      </div>
    </div>
  );
}

function PreviewFrame({ title, width, html }: { title: string; width: number; html: string }) {
  return (
    <div className="shrink-0">
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div
        className="overflow-hidden rounded-lg border bg-white shadow-sm"
        style={{ width }}
      >
        <iframe
          title={title}
          srcDoc={html}
          className="w-full bg-white"
          style={{ height: 720, border: 0 }}
          sandbox=""
        />
      </div>
    </div>
  );
}
