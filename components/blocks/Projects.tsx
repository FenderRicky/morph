const projects = [
  { name: "MORPH", tag: "AI · Frontend", desc: "An interface that rebuilds itself for every visitor, with an AI layout brain and a learning loop." },
  { name: "ARIA", tag: "AI · Local-first", desc: "A locally-run AI operating layer, built to live on your own machine." },
  { name: "Groundtruth", tag: "AI · Tooling", desc: "Audits your GitHub and resume against a target job and shows how ready your profile is." },
];

export default function Projects() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs tracking-[0.3em] text-[var(--accent)]">PROJECTS</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">Things I&apos;ve built</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.name}
            className="rounded-3xl border border-white/5 bg-[var(--card)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
          >
            <p className="text-xs text-[var(--muted)]">{p.tag}</p>
            <h3 className="mt-3 text-2xl font-semibold">{p.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
