const services = ["UI/UX Design", "Web Development", "AI Integration"];
export default function Services() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8">Services</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s} className="rounded-2xl p-6 bg-[var(--card)]">{s}</div>
        ))}
      </div>
    </section>
  );
}
