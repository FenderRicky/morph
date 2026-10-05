import Hero from "@/components/blocks/Hero";
import Projects from "@/components/blocks/Projects";
import Skills from "@/components/blocks/Skills";
import Services from "@/components/blocks/Services";
import CaseStudy from "@/components/blocks/CaseStudy";
import Contact from "@/components/blocks/Contact";

export const registry = { Hero, Projects, Skills, Services, CaseStudy, Contact } as const;
export type BlockName = keyof typeof registry;
