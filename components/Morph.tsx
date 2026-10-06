"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { registry } from "@/morph/registry";
import { presets, classify, type LayoutSpec, type Persona } from "@/morph/spec";

export default function Morph() {
  const [spec, setSpec] = useState<LayoutSpec>(presets.unknown);
  const [source, setSource] = useState("default");
  const manual = useRef(false);
  const maxScroll = useRef(0);

  useEffect(() => {
    const persona = classify();
    setSpec(presets[persona]);
    setSource("instant rules");

    const onScroll = () => {
      maxScroll.current = Math.max(maxScroll.current, window.scrollY);
    };
    window.addEventListener("scroll", onScroll);

    const t = setTimeout(async () => {
      if (manual.current) return;
      const params = new URLSearchParams(window.location.search);
      const range = document.body.scrollHeight - window.innerHeight;
      const signals = {
        persona_guess: persona,
        utm_source: params.get("utm_source"),
        mobile: window.innerWidth < 768,
        scroll_depth_pct: range > 0 ? Math.round((maxScroll.current / range) * 100) : 0,
      };
      try {
        const res = await fetch("/api/morph", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signals),
        });
        const data = await res.json();
        if (data.spec && !manual.current) {
          setSpec(data.spec);
          setSource("AI");
        }
      } catch {}
    }, 3000);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const pick = (p: Persona) => {
    manual.current = true;
    setSpec(presets[p]);
    setSource("manual");
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-1 rounded-full bg-[var(--card)] p-1 text-sm">
        {(["recruiter", "designer", "client"] as const).map((p) => (
          <button
            key={p}
            onClick={() => pick(p)}
            className={`px-3 py-1 rounded-full capitalize ${spec.persona === p ? "bg-[var(--accent)]" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>

      <main>
        <AnimatePresence mode="popLayout">
          {spec.blocks.map((name) => {
            const Block = registry[name];
            return (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
              >
                <Block />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      <p className="fixed bottom-4 left-4 max-w-xs text-xs text-[var(--muted)]">
        Morph is active · {source} · {spec.reasoning}
      </p>
    </>
  );
}
