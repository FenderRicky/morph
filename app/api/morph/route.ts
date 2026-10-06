import { NextResponse } from "next/server";
import { layoutSpec, PERSONAS } from "@/morph/spec";

const SYSTEM = `You are the layout brain for a portfolio website that adapts to each visitor.
Input: JSON visitor signals. Decide who the visitor probably is and order the page blocks for them.
Allowed blocks: Hero, Projects, Skills, Services, CaseStudy, Contact.
Allowed personas: recruiter, designer, client, unknown.
Rules:
- Hero is always first. Use only allowed blocks, no duplicates, 3 to 6 blocks.
- Recruiters want Skills and Projects early. Designers want CaseStudy and Projects early. Clients want Services and Contact early.
- Mobile visitors or shallow scrolling: fewer blocks.
Respond ONLY with JSON: {"persona": "...", "reasoning": "one short sentence", "blocks": ["Hero", ...]}`;

const SOURCES = ["linkedin", "upwork", "fiverr", "behance", "dribbble"];
const cache = new Map<string, { spec: unknown; at: number }>();
const TTL = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    const clean = {
      persona_guess: PERSONAS.includes(raw.persona_guess) ? raw.persona_guess : "unknown",
      utm_source: SOURCES.includes(String(raw.utm_source).toLowerCase()) ? String(raw.utm_source).toLowerCase() : "other",
      mobile: !!raw.mobile,
      scroll_depth_pct: Math.min(100, Math.max(0, Math.round((Number(raw.scroll_depth_pct) || 0) / 25) * 25)),
    };

    const bucket = JSON.stringify(clean);
    const hit = cache.get(bucket);
    if (hit && Date.now() - hit.at < TTL) return NextResponse.json({ spec: hit.spec, cached: true });

    const key = process.env.LLM_API_KEY;
    if (!key) throw new Error("LLM_API_KEY missing");
    const base = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
    const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(clean) },
        ],
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("empty model response: " + JSON.stringify(data).slice(0, 300));

    const spec = layoutSpec.parse(JSON.parse(text));

    const blocks = [...new Set(spec.blocks)].filter((b) => b !== "Hero");
    if (!blocks.includes("Contact")) blocks.push("Contact");
    spec.blocks = ["Hero", ...blocks];

    cache.set(bucket, { spec, at: Date.now() });
    return NextResponse.json({ spec });
  } catch (e) {
    console.error("morph brain:", e);
    return NextResponse.json({ spec: null, error: String(e) });
  }
}
