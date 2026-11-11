import { ExperienceItem, EducationItem, ProjectItem, SkillCategories, TargetJob, TemplateId } from "@/types/resume";

export type CareerStage = "student" | "fresher" | "early_career" | "mid_career" | "senior" | "lead_executive";

export type DomainPersona =
  | "fullstack"
  | "frontend"
  | "backend"
  | "aiml"
  | "devops"
  | "data_analyst"
  | "creative_ux"
  | "general_software";

export interface ProfileAnalysisResult {
  careerStage: CareerStage;
  yearsOfExperience: number;
  domainPersona: DomainPersona;
  recommendedTemplate: TemplateId;
  templateReason: string;
  recommendedLength: "1-page" | "1-2-pages" | "2-pages";
  optimalSectionOrder: string[];
}

/**
 * Calculates confirmed total years of experience from dated experience items.
 * Does not invent unverified experience.
 */
export function calculateYearsOfExperience(experiences: ExperienceItem[]): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;
  const currentYear = new Date().getFullYear();

  for (const exp of experiences) {
    if (!exp.startDate) continue;

    const startYearMatch = exp.startDate.match(/(20\d\d|19\d\d)/);
    const endYearMatch = exp.endDate ? exp.endDate.match(/(20\d\d|19\d\d)/) : null;

    if (startYearMatch) {
      const startYear = parseInt(startYearMatch[1], 10);
      const endYear = exp.isCurrent || !endYearMatch ? currentYear : parseInt(endYearMatch[1], 10);
      const diffYears = Math.max(0, endYear - startYear);
      totalMonths += Math.max(diffYears * 12, 6);
    }
  }

  return Math.round((totalMonths / 12) * 10) / 10;
}

/**
 * Identifies the professional domain persona based on role keywords, skills, and projects.
 */
export function detectDomainPersona(
  targetRole?: string | null,
  skills?: Partial<SkillCategories>,
  projects?: ProjectItem[]
): DomainPersona {
  const textPool = [
    targetRole || "",
    ...(skills?.languages || []),
    ...(skills?.frameworks || []),
    ...(skills?.cloud || []),
    ...(skills?.aiml || []),
    ...(projects?.map((p) => `${p.name} ${p.description} ${(p.technologies || []).join(" ")}`) || []),
  ].join(" ").toLowerCase();

  if (textPool.includes("machine learning") || textPool.includes("aiml") || textPool.includes("pytorch") || textPool.includes("tensorflow") || textPool.includes("llm") || textPool.includes("nlp")) {
    return "aiml";
  }
  if (textPool.includes("data analyst") || textPool.includes("data science") || textPool.includes("tableau") || textPool.includes("power bi") || textPool.includes("pandas")) {
    return "data_analyst";
  }
  if (textPool.includes("devops") || textPool.includes("sre") || textPool.includes("kubernetes") || textPool.includes("terraform") || textPool.includes("ci/cd")) {
    return "devops";
  }
  if (textPool.includes("frontend") || textPool.includes("ui") || textPool.includes("ux") || textPool.includes("react") && !textPool.includes("backend")) {
    return "frontend";
  }
  if (textPool.includes("backend") || textPool.includes("go") || textPool.includes("rust") || textPool.includes("spring") || textPool.includes("microservices")) {
    return "backend";
  }
  if (textPool.includes("designer") || textPool.includes("figma") || textPool.includes("creative")) {
    return "creative_ux";
  }
  if (textPool.includes("full-stack") || textPool.includes("fullstack") || (textPool.includes("react") && (textPool.includes("node") || textPool.includes("postgres") || textPool.includes("database")))) {
    return "fullstack";
  }

  return "general_software";
}

/**
 * Analyzes career stage and determines optimal resume structure, template, and length.
 */
export function analyzeCareerProfile(params: {
  targetRole?: string | null;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  skills?: Partial<SkillCategories>;
  certificationsCount?: number;
}): ProfileAnalysisResult {
  const { targetRole, experience = [], education = [], projects = [], skills = {} } = params;

  const yoe = calculateYearsOfExperience(experience);
  const roleLower = (targetRole || "").toLowerCase();
  const domainPersona = detectDomainPersona(targetRole, skills, projects);

  // Determine Career Stage
  let careerStage: CareerStage = "fresher";

  if (
    roleLower.includes("student") ||
    roleLower.includes("intern") ||
    (experience.length === 0 && projects.length > 0)
  ) {
    careerStage = "student";
  } else if (yoe === 0 || roleLower.includes("fresher") || roleLower.includes("graduate") || roleLower.includes("junior")) {
    careerStage = "fresher";
  } else if (yoe > 0 && yoe <= 2.5) {
    careerStage = "early_career";
  } else if (yoe > 2.5 && yoe <= 5.5) {
    careerStage = "mid_career";
  } else if (yoe > 5.5 && (roleLower.includes("lead") || roleLower.includes("manager") || roleLower.includes("director") || roleLower.includes("principal") || roleLower.includes("head") || roleLower.includes("architect"))) {
    careerStage = "lead_executive";
  } else if (yoe > 5.5) {
    careerStage = "senior";
  }

  // Determine Optimal Template & Rationale
  let recommendedTemplate: TemplateId = "ats-professional";
  let templateReason = "";

  if (careerStage === "student" || careerStage === "fresher") {
    recommendedTemplate = "student";
    templateReason = "Highlights foundational coursework, academic excellence, and hands-on GitHub projects with zero wasted space.";
  } else if (careerStage === "lead_executive") {
    recommendedTemplate = "executive";
    templateReason = "Engineered for senior leaders, emphasizing executive narrative, managerial scope, and measurable business impact.";
  } else if (domainPersona === "creative_ux") {
    recommendedTemplate = "creative-pro";
    templateReason = "Balanced visual hierarchy showcasing product aesthetics, design systems, and portfolio highlights.";
  } else if (projects.length >= 2 || domainPersona === "fullstack" || domainPersona === "backend" || domainPersona === "aiml") {
    recommendedTemplate = "tech-pro";
    templateReason = "Optimized for engineering roles with high-density skill categorization, code repositories, and technical architecture.";
  } else {
    recommendedTemplate = "ats-professional";
    templateReason = "Clean, universal single-column format benchmarked for maximum ATS parser compatibility across Fortune 500 portals.";
  }

  // Determine Section Ordering based on Career Stage
  let optimalSectionOrder: string[] = [];
  if (careerStage === "student" || careerStage === "fresher") {
    optimalSectionOrder = [
      "summary",
      "education",
      "projects",
      "skills",
      "experience",
      "certifications",
      "achievements",
    ];
  } else if (careerStage === "lead_executive") {
    optimalSectionOrder = [
      "summary",
      "experience",
      "skills",
      "projects",
      "education",
      "certifications",
      "achievements",
    ];
  } else {
    optimalSectionOrder = [
      "summary",
      "experience",
      "projects",
      "skills",
      "education",
      "certifications",
      "achievements",
    ];
  }

  // Determine Document Length
  const recommendedLength: "1-page" | "1-2-pages" | "2-pages" =
    careerStage === "student" || careerStage === "fresher"
      ? "1-page"
      : yoe >= 6 || experience.length >= 4
      ? "2-pages"
      : "1-2-pages";

  return {
    careerStage,
    yearsOfExperience: yoe,
    domainPersona,
    recommendedTemplate,
    templateReason,
    recommendedLength,
    optimalSectionOrder,
  };
}
