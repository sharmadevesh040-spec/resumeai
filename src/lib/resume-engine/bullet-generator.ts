// Varied, powerful action verbs categorized by function
const ACTION_VERBS = [
  "Architected",
  "Spearheaded",
  "Engineered",
  "Orchestrated",
  "Streamlined",
  "Optimized",
  "Implemented",
  "Designed",
  "Constructed",
  "Benchmarked",
  "Automated",
  "Refactored",
  "Standardized",
  "Formulated",
  "Deployed",
];

export interface BulletEnhancerParams {
  rawHighlights?: string[];
  rawDescription?: string;
  roleTitle?: string;
  companyName?: string;
  technologies?: string[];
  targetRole?: string | null;
  isInternship?: boolean;
}

/**
 * Transforms raw text lines into polished "Action + Task + Technology + Result" bullet points.
 * Strictly preserves honest metrics if provided; does not fabricate statistics.
 */
export function generateExperienceBullets(params: BulletEnhancerParams): string[] {
  const {
    rawHighlights = [],
    rawDescription = "",
    roleTitle = "Software Engineer",
    companyName = "Company",
    technologies = [],
    targetRole,
    isInternship = false,
  } = params;

  const techPhrase = technologies.length > 0 ? technologies.slice(0, 3).join(", ") : "";

  // Combine raw highlights and split description
  const candidates: string[] = [];

  if (rawHighlights.length > 0) {
    rawHighlights.forEach((h) => candidates.push(h.trim()));
  }

  if (rawDescription) {
    rawDescription
      .split(/\.\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15)
      .forEach((s) => {
        if (!candidates.includes(s)) candidates.push(s);
      });
  }

  const cleanedBullets: string[] = [];
  let verbIdx = 0;

  for (const raw of candidates) {
    if (cleanedBullets.length >= 4) break;

    // Check if the raw text already contains quantitative metrics (e.g. "40%", "$10k", "500 users")
    const hasMetric = /(?:\d+%\s*|\$\d+|\d+\s*users|\d+x|\d+\s*ms)/i.test(raw);

    // Clean common conversational prefixes
    let refined = raw
      .replace(/^(?:worked on|responsible for|helped to|assisted in|participated in|tasked with)\s*/i, "")
      .replace(/^[•\-\*]\s*/, "")
      .trim();

    if (!refined) continue;

    // Ensure it starts with a strong action verb
    const firstWord = refined.split(" ")[0];
    const startsWithVerb = ACTION_VERBS.some((v) => v.toLowerCase() === firstWord.toLowerCase());

    if (!startsWithVerb) {
      const verb = ACTION_VERBS[verbIdx % ACTION_VERBS.length];
      verbIdx++;
      const lowerFirst = refined.charAt(0).toLowerCase() + refined.slice(1);
      refined = `${verb} ${lowerFirst}`;
    }

    // If technical stack is known and not mentioned, seamlessly append technology clause
    if (techPhrase && !refined.toLowerCase().includes(technologies[0].toLowerCase())) {
      refined = refined.replace(/\.$/, "") + ` utilizing ${techPhrase} to ensure high maintainability and system resilience.`;
    } else if (!refined.endsWith(".")) {
      refined += ".";
    }

    cleanedBullets.push(refined);
  }

  // If no bullets were extractable from raw text, produce 3 strong, role-specific ATS bullets
  if (cleanedBullets.length === 0) {
    const verb1 = isInternship ? "Collaborated" : "Architected";
    const verb2 = "Engineered";
    const verb3 = "Streamlined";

    const tech1 = techPhrase || "modern full-stack architecture";

    if (isInternship) {
      cleanedBullets.push(
        `${verb1} with senior engineers to implement core application modules using ${tech1}, adhering to test-driven design standards.`
      );
      cleanedBullets.push(
        `${verb2} robust API endpoints and database validation routines, enhancing cross-platform data consistency.`
      );
      cleanedBullets.push(
        `${verb3} daily standups, code review feedback, and automated CI/CD pipeline deployments across agile sprint cycles.`
      );
    } else {
      cleanedBullets.push(
        `${verb1} and deployed mission-critical software components utilizing ${tech1}, ensuring high throughput and optimal load performance.`
      );
      cleanedBullets.push(
        `${verb2} modular services, structured asynchronous workflows, and integrated comprehensive unit testing suites.`
      );
      cleanedBullets.push(
        `${verb3} engineering delivery by conducting rigorous peer code reviews and standardizing version-controlled Git workflows.`
      );
    }
  }

  return cleanedBullets;
}
