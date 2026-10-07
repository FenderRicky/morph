const steps = [
  { label: "Problem", text: "Every visitor gets the same page, whether they are hiring, buying, or browsing." },
  { label: "Approach", text: "Read coarse signals, let an AI propose a layout, validate it, and learn from clicks." },
  { label: "Result", text: "A page that rearranges itself and shows its reasoning. The dashboard is live." },
];

export default function CaseStudy() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs tracking-[0.3em] text-[var(--accent)]">CASE STUDY</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">MORPH: a UI that redesigns itself</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.label} className="rounded-3xl border border-white/5 bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--accent)]">{s.label}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.text}</p>
          </div>
        ))}
      </div>
      <a href="/dashboard" className="mt-8 inline-block text-sm text-[var(--accent)] hover:underline">
        See the live dashboard →
      </a>
    </section>
  );
}
