"use client";
import { useEffect, useRef } from "react";
import type { LayoutSpec } from "@/morph/spec";

function send(body: object) {
  try {
    const data = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([data], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body: data, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {}
}

export default function Tracker({ spec, source }: { spec: LayoutSpec; source: string }) {
  const sid = useRef("");
  const layout = spec.blocks.join(">");
  const last = useRef({ layout, persona: spec.persona, source, reasoning: spec.reasoning });

  useEffect(() => {
    sid.current = Math.random().toString(36).slice(2, 10);
  }, []);

  useEffect(() => {
    last.current = { layout, persona: spec.persona, source, reasoning: spec.reasoning };
    if (source === "default") return;
    const t = setTimeout(() => send({ type: "view", sid: sid.current, ...last.current }), 1500);
    return () => clearTimeout(t);
  }, [layout, source, spec.persona, spec.reasoning]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[data-cta]");
      if (a) send({ type: "convert", sid: sid.current, ...last.current });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
