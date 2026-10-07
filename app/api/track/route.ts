import { NextResponse } from "next/server";
import { BLOCKS, PERSONAS } from "@/morph/spec";
import { insertEvent } from "@/lib/store";

const SOURCES = ["instant rules", "AI", "manual", "original"];

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const blocks = String(raw.layout || "").split(">");
    const valid = blocks.every((b) => (BLOCKS as readonly string[]).includes(b));
    if (!["view", "convert"].includes(raw.type) || !valid) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await insertEvent({
      type: raw.type,
      sid: String(raw.sid || "").slice(0, 12),
      layout: blocks.join(">"),
      persona: (PERSONAS as readonly string[]).includes(raw.persona) ? raw.persona : "unknown",
      source: SOURCES.includes(raw.source) ? raw.source : "other",
      reasoning: String(raw.reasoning || "").slice(0, 240),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("track:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
