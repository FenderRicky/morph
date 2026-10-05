const skills = ["Next.js", "React", "TypeScript", "Tailwind", "Figma", "Python", "LLM APIs"];
export default function Skills() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8">Skills</h2>
      <div className="flex flex-wrap gap-3">
        {skills.map((s) => (
          <span key={s} className="px-4 py-2 rounded-full bg-[var(--card)]">{s}</span>
        ))}
      </div>
    </section>
  );
}
