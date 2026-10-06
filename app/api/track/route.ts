import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { BLOCKS, PERSONAS } from "@/morph/spec";

const FILE = path.join(process.cwd(), "data", "events.jsonl");
const SOURCES = ["instant rules", "AI", "manual", "original"];

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const blocks = String(raw.layout || "").split(">");
    const valid = blocks.every((b) => (BLOCKS as readonly string[]).includes(b));
    if (!["view", "convert"].includes(raw.type) || !valid) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const ev = {
      t: new Date().toISOString(),
      type: raw.type,
      sid: String(raw.sid || "").slice(0, 12),
      layout: blocks.join(">"),
      persona: (PERSONAS as readonly string[]).includes(raw.persona) ? raw.persona : "unknown",
      source: SOURCES.includes(raw.source) ? raw.source : "other",
      reasoning: String(raw.reasoning || "").slice(0, 160),
    };
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.appendFile(FILE, JSON.stringify(ev) + "\n");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
