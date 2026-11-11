import { callGemini } from "./gemini";
import {
  PROFESSIONAL_SUMMARY_SYSTEM_PROMPT,
  EXPERIENCE_IMPROVEMENT_SYSTEM_PROMPT,
  RESUME_COACH_SYSTEM_PROMPT,
} from "./gemini-prompts";
import {
  ProfessionalSummaryResponseSchema,
  ProfessionalSummaryResponse,
  ExperienceBulletsResponseSchema,
  ExperienceBulletsResponse,
  ResumeCoachResponseSchema,
  ResumeCoachResponse,
} from "./gemini-schemas";

export interface SummaryGenerationOptions {
  careerStage?: string;
  verifiedSkills: string[];
  targetRole?: string;
  companyName?: string;
  jobDescription?: string;
  recentExperience?: string;
  topProjects?: string[];
}

export interface BulletImprovementOptions {
  role: string;
  company: string;
  rawText?: string;
  rawHighlights?: string[];
  targetRole?: string;
  technologies?: string[];
  isInternship?: boolean;
}

export interface ContentRewriteOptions {
  text: string;
  action: "shorten" | "expand" | "make_professional" | "fix_grammar" | "optimize_for_job";
  targetRole?: string;
  jobDescription?: string;
  context?: string;
}

/**
 * Generates an executive, evidence-backed professional summary using Gemini.
 */
export async function generateProfessionalSummaryWithGemini(
  options: SummaryGenerationOptions
): Promise<ProfessionalSummaryResponse> {
  const prompt = `
Write a professional resume summary with the following candidate details:
- Career Stage: ${options.careerStage || "Professional"}
- Target Role: ${options.targetRole || "Software Engineer"}
- Target Company: ${options.companyName || "Target Employer"}
- Verified Technical Skills: ${options.verifiedSkills.slice(0, 10).join(", ") || "General Engineering"}
- Recent Work / Projects: ${options.recentExperience || "Engineering projects"}
- Notable Project Themes: ${options.topProjects?.slice(0, 3).join(", ") || "None"}
- Target Job Description Keywords: ${options.jobDescription ? options.jobDescription.slice(0, 300) : "Standard role expectations"}

Requirements:
1. 3 to 4 concise sentences.
2. Grounded exclusively in verified skills and experience.
3. No generic buzzwords.
4. Output valid JSON in this exact structure:
   {
     "summary": "...",
     "keyStrengths": ["...", "..."],
     "targetRoleAlignment": "..."
   }
`;

  return callGemini<ProfessionalSummaryResponse>({
    systemInstruction: PROFESSIONAL_SUMMARY_SYSTEM_PROMPT,
    prompt,
    schema: ProfessionalSummaryResponseSchema,
    taskType: "standard",
    operationName: "summary_generator",
    fallbackFn: () => {
      const skillsStr = options.verifiedSkills.slice(0, 4).join(", ") || "modern software engineering tools";
      const roleStr = options.targetRole || "Software Engineer";
      return {
        summary: `Results-driven ${roleStr} with hands-on proficiency in ${skillsStr}. Experienced in building scalable applications, designing modular software architectures, and collaborating across agile engineering teams to deliver high-quality solutions.`,
        keyStrengths: options.verifiedSkills.slice(0, 3),
        targetRoleAlignment: `Aligned with ${roleStr} requirements`,
      };
    },
  });
}

/**
 * Transforms raw experience notes into Action + Task + Tech + Result bullets using Gemini.
 */
export async function improveExperienceBulletsWithGemini(
  options: BulletImprovementOptions
): Promise<ExperienceBulletsResponse> {
  const prompt = `
Improve the work experience bullets for:
- Role Title: "${options.role}"
- Company: "${options.company}"
- Employment Type: ${options.isInternship ? "Internship" : "Full-time"}
- Target Role: "${options.targetRole || "Software Engineering"}"
- Known Technologies: ${options.technologies?.slice(0, 8).join(", ") || "Standard tech stack"}
- Raw Input Description / Highlights:
  ${options.rawText || (options.rawHighlights && options.rawHighlights.length > 0 ? options.rawHighlights.join("\n  ") : "Engineered features and collaborated on application development.")}

Requirements:
1. Generate 3 to 4 strong, distinctive bullet points.
2. Pattern: [Strong Action Verb] + [Specific Technical Task/System] + [Technologies Used] + [Verified Impact or Engineering Outcome].
3. Do NOT invent fake revenue or percentage metrics. Articulate engineering outcomes (e.g. enhanced maintainability, enabled automated testing, reduced redundant queries).
4. Output valid JSON in this exact structure:
   {
     "bullets": ["bullet 1", "bullet 2", "bullet 3"],
     "actionVerbsUsed": ["Architected", "Engineered", "Implemented"],
     "quantifiedOutcomesIdentified": false
   }
`;

  return callGemini<ExperienceBulletsResponse>({
    systemInstruction: EXPERIENCE_IMPROVEMENT_SYSTEM_PROMPT,
    prompt,
    schema: ExperienceBulletsResponseSchema,
    taskType: "standard",
    operationName: "experience_bullets",
    fallbackFn: () => {
      const role = options.role || "Software Engineer";
      const techList = options.technologies?.slice(0, 3).join(", ") || "modern frameworks";
      return {
        bullets: [
          `Architected and deployed responsive full-stack features utilizing ${techList}, enhancing user workflow efficiency.`,
          `Collaborated with cross-functional product teams to design reusable components and maintain clean codebase standards.`,
          `Streamlined API communication and database operations to support scalable application performance.`,
        ],
        actionVerbsUsed: ["Architected", "Collaborated", "Streamlined"],
        quantifiedOutcomesIdentified: false,
      };
    },
  });
}

/**
 * Rewrites or refines content according to specific coach actions (shorten, expand, professional, grammar).
 */
export async function rewriteContentWithGemini(
  options: ContentRewriteOptions
): Promise<ResumeCoachResponse> {
  const prompt = `
Execute coaching action "${options.action}" on the following resume text:
- Original Text: "${options.text}"
- Target Role: "${options.targetRole || "Professional"}"
- Context / Section: "${options.context || "General"}"
${options.jobDescription ? `- Job Description Context: ${options.jobDescription.slice(0, 200)}` : ""}

Provide the improved text, clear explanation of changes, and a list of key adjustments made.
`;

  return callGemini<ResumeCoachResponse>({
    systemInstruction: RESUME_COACH_SYSTEM_PROMPT,
    prompt,
    schema: ResumeCoachResponseSchema,
    taskType: "standard",
    operationName: "content_rewrite",
    fallbackFn: () => {
      let suggested = options.text;
      if (options.action === "shorten") {
        suggested = options.text.split(".")[0] + ".";
      } else if (options.action === "make_professional") {
        suggested = options.text.replace(/\bi\s+did\b/gi, "Engineered").replace(/\bhelped\b/gi, "Facilitated");
      }
      return {
        action: options.action,
        originalText: options.text,
        suggestedText: suggested,
        explanation: `Applied ${options.action} optimization based on technical resume guidelines.`,
        keyChanges: [`Refined wording for ${options.action}`],
      };
    },
  });
}
