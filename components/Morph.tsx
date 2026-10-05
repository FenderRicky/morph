"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { registry } from "@/morph/registry";
import { presets, classify, type Persona } from "@/morph/spec";

export default function Morph() {
  const [persona, setPersona] = useState<Persona>("unknown");
  useEffect(() => setPersona(classify()), []);
  const spec = presets[persona];

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-1 rounded-full bg-[var(--card)] p-1 text-sm">
        {(["recruiter", "designer", "client"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPersona(p)}
            className={`px-3 py-1 rounded-full capitalize ${persona === p ? "bg-[var(--accent)]" : ""}`}
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
        Morph is active · {spec.reasoning}
      </p>
    </>
  );
}
