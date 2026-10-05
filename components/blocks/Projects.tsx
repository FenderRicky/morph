const items = ["MORPH", "ARIA", "Groundtruth"];
export default function Projects() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8">Projects</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p} className="rounded-2xl p-6 bg-[var(--card)]">{p}</div>
        ))}
      </div>
    </section>
  );
}
