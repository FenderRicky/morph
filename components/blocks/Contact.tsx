export default function Contact() {
  const to = "thadigotlavineeth7@gmail.com";
  const href = `https://mail.google.com/mail/?view=cm&to=${to}&su=${encodeURIComponent("Let's work together")}`;
  return (
    <section className="px-6 py-24 max-w-5xl mx-auto text-center">
      <h2 className="text-4xl font-bold">Let&apos;s work together</h2>
      <a
        data-cta
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-8 px-8 py-3 rounded-full bg-[var(--accent)] text-white"
      >
        Book a call
      </a>
      <p className="mt-4 text-sm text-[var(--muted)]">or write to {to}</p>
    </section>
  );
}
