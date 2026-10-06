import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

type Ev = { t: string; type: "view" | "convert"; sid: string; layout: string; persona: string; source: string; reasoning: string };

export default async function Dashboard() {
  let events: Ev[] = [];
  try {
    const txt = await fs.readFile(path.join(process.cwd(), "data", "events.jsonl"), "utf8");
    events = txt.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {}

  const real = events.filter((e) => e.source !== "manual" && e.source !== "original");
  const rows = new Map<string, { views: number; conv: number; persona: string }>();
  for (const e of real) {
    const r = rows.get(e.layout) || { views: 0, conv: 0, persona: e.persona };
    if (e.type === "view") r.views++;
    else r.conv++;
    rows.set(e.layout, r);
  }
  const table = [...rows.entries()].sort((a, b) => b[1].views - a[1].views);
  const views = real.filter((e) => e.type === "view").length;
  const conv = real.filter((e) => e.type === "convert").length;
  const recent = events.filter((e) => e.type === "view").slice(-12).reverse();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm tracking-widest text-[var(--accent)]">MORPH DASHBOARD</p>
      <h1 className="mt-2 text-4xl font-bold">What the engine decided, and what worked</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Manual persona clicks and &quot;show original&quot; are excluded from the stats.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Layout views", views],
          ["Book-a-call clicks", conv],
          ["Conversion", views ? ((conv / views) * 100).toFixed(1) + "%" : "-"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-2xl font-semibold">Layouts compared</h2>
      <div className="overflow-x-auto rounded-2xl bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="text-[var(--muted)]">
            <tr><th className="p-4">Layout</th><th className="p-4">Persona</th><th className="p-4">Views</th><th className="p-4">Clicks</th><th className="p-4">Rate</th></tr>
          </thead>
          <tbody>
            {table.length === 0 && <tr><td className="p-4 text-[var(--muted)]" colSpan={5}>No data yet. Open the site, wait 5 seconds, click Book a call.</td></tr>}
            {table.map(([layout, r]) => (
              <tr key={layout} className="border-t border-white/5">
                <td className="p-4">{layout.split(">").join(" → ")}</td>
                <td className="p-4 capitalize">{r.persona}</td>
                <td className="p-4">{r.views}</td>
                <td className="p-4">{r.conv}</td>
                <td className="p-4">{r.views ? ((r.conv / r.views) * 100).toFixed(0) + "%" : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 mb-4 text-2xl font-semibold">Recent decisions</h2>
      <div className="space-y-3">
        {recent.length === 0 && <p className="text-sm text-[var(--muted)]">Nothing logged yet.</p>}
        {recent.map((e, i) => (
          <div key={i} className="rounded-2xl bg-[var(--card)] p-4 text-sm">
            <p><b className="capitalize">{e.persona}</b> · {e.source} · <span className="text-[var(--muted)]">{new Date(e.t).toLocaleTimeString()}</span></p>
            <p className="mt-1">{e.reasoning}</p>
            <p className="mt-1 text-[var(--muted)]">{e.layout.split(">").join(" → ")}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
