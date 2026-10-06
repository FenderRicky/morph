import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { layoutSpec, presets, PERSONAS, type LayoutSpec, type Persona } from "@/morph/spec";

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
const aiCache = new Map<string, { spec: LayoutSpec; at: number }>();
const TTL = 10 * 60 * 1000;
const EXPLORE = 0.2;

type Stat = { views: number; conv: number };

// Only count layouts that were served by the brain (source "AI"), so instant-rule flashes don't skew results
async function loadStats() {
  const m = new Map<string, Stat>();
  try {
    const txt = await fs.readFile(path.join(process.cwd(), "data", "events.jsonl"), "utf8");
    for (const line of txt.trim().split("\n")) {
      try {
        const e = JSON.parse(line);
        if (e.source !== "AI") continue;
        const r = m.get(e.layout) || { views: 0, conv: 0 };
        if (e.type === "view") r.views++;
        else if (e.type === "convert") r.conv++;
        m.set(e.layout, r);
      } catch {}
    }
  } catch {}
  return m;
}

async function askAI(clean: object): Promise<LayoutSpec> {
  const key = process.env.LLM_API_KEY;
  if (!key) throw new Error("LLM_API_KEY missing");
  const base = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.LLM_MODEL || "openai/gpt-oss-20b";

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
  return spec;
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    const clean = {
      persona_guess: PERSONAS.includes(raw.persona_guess) ? (raw.persona_guess as Persona) : "unknown",
      utm_source: SOURCES.includes(String(raw.utm_source).toLowerCase()) ? String(raw.utm_source).toLowerCase() : "other",
      mobile: !!raw.mobile,
      scroll_depth_pct: Math.min(100, Math.max(0, Math.round((Number(raw.scroll_depth_pct) || 0) / 25) * 25)),
    };

    // 1. The AI proposes (cached per visitor type)
    const bucket = JSON.stringify(clean);
    let ai: LayoutSpec;
    const hit = aiCache.get(bucket);
    if (hit && Date.now() - hit.at < TTL) {
      ai = hit.spec;
    } else {
      ai = await askAI(clean);
      aiCache.set(bucket, { spec: ai, at: Date.now() });
    }

    // 2. The learning loop decides between candidates
    const candidates = new Map<string, LayoutSpec>();
    for (const s of [ai, presets[clean.persona_guess], presets.unknown]) {
      const k = s.blocks.join(">");
      if (!candidates.has(k)) candidates.set(k, s);
    }
    const stats = await loadStats();
    const rate = (k: string) => {
      const r = stats.get(k) || { views: 0, conv: 0 };
      return (r.conv + 1) / (r.views + 2); // untried layouts start optimistic at 0.5
    };
    const keys = [...candidates.keys()];
    const explore = Math.random() < EXPLORE;
    const pick = explore ? keys[Math.floor(Math.random() * keys.length)] : [...keys].sort((a, b) => rate(b) - rate(a))[0];

    const chosen = candidates.get(pick)!;
    const r = stats.get(pick) || { views: 0, conv: 0 };
    const note = `${explore ? "exploring" : "best so far"}: ${r.conv}/${r.views} clicks`;

    return NextResponse.json({ spec: { ...chosen, reasoning: `${chosen.reasoning} [Learning loop, ${note}]` } });
  } catch (e) {
    console.error("morph brain:", e);
    return NextResponse.json({ spec: null, error: String(e) });
  }
}
