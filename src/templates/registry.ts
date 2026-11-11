import React from "react";
import { TemplateId } from "@/types/resume";
import { ATSProfessional } from "./ATSProfessional";
import { ModernMinimal } from "./ModernMinimal";
import { TechPro } from "./TechPro";
import { Student } from "./Student";
import { Executive } from "./Executive";
import { Creative } from "./Creative";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  bestFor: string[];
  atsRating: number; // 1-5
  atsCompatibilityPercent: number; // e.g. 98%
  layout: "Single column" | "Two column" | "Hybrid";
  recommendedTypography: string;
  component: React.ComponentType<{ data: any; isMiniature?: boolean }>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  "ats-professional": {
    id: "ats-professional",
    name: "ATS Professional",
    category: "Corporate & Technology",
    description: "Clean single-column layout engineered specifically for maximum ATS parsing accuracy.",
    bestFor: ["Corporate", "Software", "Finance", "Consulting", "Internships"],
    atsRating: 5,
    atsCompatibilityPercent: 99,
    layout: "Single column",
    recommendedTypography: "Inter / Roboto",
    component: ATSProfessional,
  },
  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Minimal",
    category: "Tech & Business",
    description: "Clean modern typography with balanced hierarchy, subtle accents, and clean layout.",
    bestFor: ["Startups", "Technology", "Business", "Product Management"],
    atsRating: 5,
    atsCompatibilityPercent: 96,
    layout: "Hybrid",
    recommendedTypography: "Inter",
    component: ModernMinimal,
  },
  "tech-pro": {
    id: "tech-pro",
    name: "Tech Pro",
    category: "Engineering & AI",
    description: "Tailored for software engineers with technical stacks, GitHub repositories, and system architectures.",
    bestFor: ["Software Engineers", "AI / ML", "Developers", "Cloud Architects"],
    atsRating: 5,
    atsCompatibilityPercent: 97,
    layout: "Single column",
    recommendedTypography: "Geist / Roboto",
    component: TechPro,
  },
  student: {
    id: "student",
    name: "Student & Fresher",
    category: "Entry Level",
    description: "Spotlights academic excellence, university projects, hackathons, and certifications first.",
    bestFor: ["College Students", "Freshers", "Internships", "Hackathons"],
    atsRating: 5,
    atsCompatibilityPercent: 98,
    layout: "Single column",
    recommendedTypography: "Inter",
    component: Student,
  },
  executive: {
    id: "executive",
    name: "Executive Leader",
    category: "Leadership & Strategy",
    description: "Authoritative serif typography and strategic impact structure designed for leadership roles.",
    bestFor: ["Senior Professionals", "Directors", "VP / Engineering", "Leadership"],
    atsRating: 5,
    atsCompatibilityPercent: 95,
    layout: "Single column",
    recommendedTypography: "Merriweather / Playfair",
    component: Executive,
  },
  "creative-pro": {
    id: "creative-pro",
    name: "Creative Professional",
    category: "Design & Product",
    description: "Refined visual hierarchy with two-column balance for creative, design, and media practitioners.",
    bestFor: ["Design", "UI / UX", "Marketing", "Media", "Creative Roles"],
    atsRating: 4,
    atsCompatibilityPercent: 91,
    layout: "Two column",
    recommendedTypography: "Inter / Playfair",
    component: Creative,
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);
