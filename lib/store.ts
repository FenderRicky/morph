export type Ev = {
  t: string;
  type: "view" | "convert";
  sid: string;
  layout: string;
  persona: string;
  source: string;
  reasoning: string;
};

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;

function headers(extra: Record<string, string> = {}) {
  return { apikey: KEY as string, "Content-Type": "application/json", ...extra };
}

export async function insertEvent(ev: Omit<Ev, "t">) {
  if (!URL_ || !KEY) throw new Error("Supabase env missing");
  const res = await fetch(`${URL_}/rest/v1/events`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(ev),
  });
  if (!res.ok) throw new Error("insert failed: " + res.status + " " + (await res.text()).slice(0, 200));
}

export async function loadEvents(limit = 5000): Promise<Ev[]> {
  if (!URL_ || !KEY) return [];
  const res = await fetch(
    `${URL_}/rest/v1/events?select=t,type,sid,layout,persona,source,reasoning&order=t.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return [];
  return ((await res.json()) as Ev[]).reverse();
}
