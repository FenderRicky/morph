"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { registry } from "@/morph/registry";
import { presets, classify, type LayoutSpec, type Persona } from "@/morph/spec";
import Tracker from "@/components/Tracker";

type Source = "default" | "instant rules" | "AI" | "manual" | "original";

export default function Morph() {
  const [spec, setSpec] = useState<LayoutSpec>(presets.unknown);
  const [source, setSource] = useState<Source>("default");
  const [open, setOpen] = useState(false);
  const auto = useRef<{ spec: LayoutSpec; source: Source }>({ spec: presets.unknown, source: "default" });
  const manual = useRef(false);
  const maxScroll = useRef(0);

  useEffect(() => {
    const persona = classify();
    auto.current = { spec: presets[persona], source: "instant rules" };
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
        if (data.spec) {
          auto.current = { spec: data.spec, source: "AI" };
          if (!manual.current) {
            setSpec(data.spec);
            setSource("AI");
          }
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
  const showOriginal = () => {
    manual.current = true;
    setSpec(presets.unknown);
    setSource("original");
  };
  const backToMorph = () => {
    manual.current = false;
    setSpec(auto.current.spec);
    setSource(auto.current.source);
  };

  const paused = source === "original" || source === "manual";

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

      <Tracker spec={spec} source={source} />
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

      <div className="fixed bottom-4 left-4 z-50 max-w-xs text-sm">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 rounded-2xl border border-white/10 bg-[var(--card)] p-4 shadow-xl"
            >
              <p className="text-xs uppercase tracking-widest text-[var(--accent)]">Why this layout?</p>
              <p className="mt-2">{spec.reasoning}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                Detected: <b>{spec.persona}</b> · Source: <b>{source}</b>
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Order: {spec.blocks.join(" → ")}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                Only coarse signals are used: traffic source, screen size, scroll depth. Nothing personal is stored.
              </p>
              <div className="mt-3">
                {paused ? (
                  <button onClick={backToMorph} className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-white">
                    Back to Morph
                  </button>
                ) : (
                  <button onClick={showOriginal} className="rounded-full bg-white/10 px-4 py-1.5">
                    Show original
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-[var(--card)] px-4 py-2"
        >
          <span className={`h-2 w-2 rounded-full bg-[var(--accent)] ${paused ? "" : "animate-pulse"}`} />
          Morph {paused ? "paused" : "active"}
        </button>
      </div>
    </>
  );
}
