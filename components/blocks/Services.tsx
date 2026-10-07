const services = [
  { name: "UI/UX Design", desc: "Interfaces people understand at a glance, from research to polished screens." },
  { name: "Web Development", desc: "Fast, responsive sites and apps built with Next.js and React." },
  { name: "AI Integration", desc: "Adding LLM-powered features to your product, with guardrails." },
];

export default function Services() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs tracking-[0.3em] text-[var(--accent)]">SERVICES</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">How I can help</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {services.map((s) => (
          <div key={s.name} className="rounded-3xl border border-white/5 bg-[var(--card)] p-6">
            <h3 className="text-xl font-semibold">{s.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
