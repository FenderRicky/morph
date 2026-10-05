import { z } from "zod";

export const BLOCKS = ["Hero", "Projects", "Skills", "Services", "CaseStudy", "Contact"] as const;
export const PERSONAS = ["recruiter", "designer", "client", "unknown"] as const;
export type Persona = (typeof PERSONAS)[number];

export const layoutSpec = z.object({
  persona: z.enum(PERSONAS),
  reasoning: z.string(),
  blocks: z.array(z.enum(BLOCKS)).min(1).max(6),
});
export type LayoutSpec = z.infer<typeof layoutSpec>;

export const presets: Record<Persona, LayoutSpec> = {
  unknown: {
    persona: "unknown",
    reasoning: "No signals yet, showing the default layout.",
    blocks: ["Hero", "Projects", "Skills", "Services", "CaseStudy", "Contact"],
  },
  recruiter: {
    persona: "recruiter",
    reasoning: "Recruiter detected: skills and projects first, contact last.",
    blocks: ["Hero", "Skills", "Projects", "Contact"],
  },
  designer: {
    persona: "designer",
    reasoning: "Designer detected: visuals and case studies first.",
    blocks: ["Hero", "CaseStudy", "Projects", "Contact"],
  },
  client: {
    persona: "client",
    reasoning: "Client detected: services and a call to action up top.",
    blocks: ["Hero", "Services", "Contact", "Projects"],
  },
};

// Instant rule-based classifier (the fast path, runs in the browser)
export function classify(): Persona {
  const params = new URLSearchParams(window.location.search);
  const src = (params.get("utm_source") || document.referrer || "").toLowerCase();
  if (src.includes("linkedin")) return "recruiter";
  if (src.includes("upwork") || src.includes("fiverr")) return "client";
  if (src.includes("behance") || src.includes("dribbble")) return "designer";
  return "unknown";
}
