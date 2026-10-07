export default function Contact() {
  const to = "thadigotlavineeth7@gmail.com";
  const href = `https://mail.google.com/mail/?view=cm&to=${to}&su=${encodeURIComponent("Let's work together")}`;
  return (
    <section className="glow">
      <div className="mx-auto max-w-5xl px-6 py-28 text-center">
        <h2 className="text-5xl font-bold tracking-tight md:text-6xl">Let&apos;s work together</h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">Got a product that should adapt to its users? Tell me about it.</p>
        <a
          data-cta
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block rounded-full bg-[var(--accent)] px-10 py-4 text-lg text-white transition hover:scale-105"
        >
          Book a call
        </a>
        <p className="mt-4 text-sm text-[var(--muted)]">or write to {to}</p>
      </div>
    </section>
  );
}
