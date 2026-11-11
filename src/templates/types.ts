import { ResumeData } from "@/types/resume";

export interface TemplateProps {
  data: ResumeData;
  scale?: number;
  isMiniature?: boolean;
}

export function getFontFamilyClass(font?: string): string {
  switch (font) {
    case "merriweather":
      return "font-serif";
    case "roboto":
      return "font-sans";
    case "playfair":
      return "font-serif tracking-wide";
    case "geist":
      return "font-mono";
    case "inter":
    default:
      return "font-sans";
  }
}

export function getFontSizeClass(size?: string): {
  base: string;
  name: string;
  title: string;
  section: string;
  sub: string;
} {
  switch (size) {
    case "sm":
      return {
        base: "text-[12px] leading-relaxed",
        name: "text-xl font-bold tracking-tight",
        title: "text-xs font-medium",
        section: "text-xs font-bold tracking-wider uppercase",
        sub: "text-[11px]",
      };
    case "lg":
      return {
        base: "text-[14px] leading-relaxed",
        name: "text-2xl font-bold tracking-tight",
        title: "text-sm font-medium",
        section: "text-sm font-bold tracking-wider uppercase",
        sub: "text-xs",
      };
    case "base":
    default:
      return {
        base: "text-[13px] leading-relaxed",
        name: "text-2xl font-bold tracking-tight",
        title: "text-sm font-medium",
        section: "text-xs font-bold tracking-wider uppercase",
        sub: "text-[11px]",
      };
  }
}

export function getSpacingClass(spacing?: string): {
  sectionGap: string;
  itemGap: string;
  bulletGap: string;
} {
  switch (spacing) {
    case "compact":
      return {
        sectionGap: "space-y-3",
        itemGap: "space-y-1.5",
        bulletGap: "space-y-0.5",
      };
    case "relaxed":
      return {
        sectionGap: "space-y-6",
        itemGap: "space-y-3.5",
        bulletGap: "space-y-1.5",
      };
    case "normal":
    default:
      return {
        sectionGap: "space-y-4",
        itemGap: "space-y-2.5",
        bulletGap: "space-y-1",
      };
  }
}

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "internships",
  "projects",
  "skills",
  "education",
  "coursework",
  "certifications",
  "achievements",
  "leadership",
  "publications",
];

export function getEffectiveSectionOrder(customOrder?: string[]): string[] {
  if (!customOrder || customOrder.length === 0) return DEFAULT_SECTION_ORDER;
  const result = [...customOrder];
  for (const defaultKey of DEFAULT_SECTION_ORDER) {
    if (!result.includes(defaultKey)) {
      result.push(defaultKey);
    }
  }
  return result;
}

export function getMarginsClass(margins?: string): string {
  switch (margins) {
    case "compact":
      return "p-6 md:p-8";
    case "wide":
      return "p-10 md:p-14";
    case "normal":
    default:
      return "p-8 md:p-10";
  }
}
