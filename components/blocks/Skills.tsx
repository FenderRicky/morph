const groups = [
  { title: "Design", items: ["UI/UX", "Figma", "Graphic design", "Brand identity"] },
  { title: "Build", items: ["Next.js", "React", "TypeScript", "Tailwind"] },
  { title: "AI", items: ["Python", "LLM APIs"] },
];

export default function Skills() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs tracking-[0.3em] text-[var(--accent)]">SKILLS</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">Design, build, and AI in one place</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-4 text-sm text-[var(--muted)]">{g.title}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((s) => (
                <span key={s} className="rounded-full border border-white/5 bg-[var(--card)] px-4 py-2 text-sm">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
