import { callGemini } from "./gemini";
import { TEMPLATE_RECOMMENDER_SYSTEM_PROMPT } from "./gemini-prompts";
import {
  TemplateRecommendationResponseSchema,
  TemplateRecommendationResponse,
} from "./gemini-schemas";
import { ResumeData, TemplateId } from "@/types/resume";

export interface TemplateRecommenderInput {
  resume?: ResumeData;
  careerStage?: string;
  targetRole?: string;
  experienceCount?: number;
  projectCount?: number;
}

/**
 * Recommends the optimal resume template based on candidate experience and target role using Gemini.
 */
export async function recommendTemplateWithGemini(
  input: TemplateRecommenderInput
): Promise<TemplateRecommendationResponse> {
  const expCount = input.experienceCount ?? input.resume?.experience?.length ?? 0;
  const projCount = input.projectCount ?? input.resume?.projects?.length ?? 0;
  const stage = input.careerStage || (expCount === 0 ? "Fresher" : expCount >= 8 ? "Executive" : "Mid-Level");
  const role = input.targetRole || input.resume?.personal?.headline || "Software Engineer";

  const prompt = `
Recommend the optimal resume template for this candidate:
- Career Stage: "${stage}"
- Target Job Role: "${role}"
- Verified Work Experience Count: ${expCount}
- Verified Projects Count: ${projCount}

Templates available:
1. "ats-professional" (Single-column layout, corporate, finance, software engineering)
2. "modern-minimal" (Contemporary layout, startups, product designers, full-stack engineers)
3. "tech-pro" (Skills-dense matrix, prominent GitHub links, systems/DevOps/backend)
4. "student" (Education & projects emphasized near the top, freshers & university grads)
5. "executive" (Leadership trajectory, high-level impact, directors, VPs, managers)
6. "creative" (Subtle styling, UI/UX, design, creative engineering)

Return:
1. recommendedTemplateId (one of the 6 template IDs above)
2. reason: 1-2 sentence justification for why this layout best presents the candidate's background
3. alternativeTemplates: array of 2-3 suitable alternative template IDs
`;

  return callGemini<TemplateRecommendationResponse>({
    systemInstruction: TEMPLATE_RECOMMENDER_SYSTEM_PROMPT,
    prompt,
    schema: TemplateRecommendationResponseSchema,
    taskType: "standard",
    operationName: "template_recommender",
    fallbackFn: () => {
      let rec: TemplateId = "ats-professional";
      let alt: TemplateId[] = ["modern-minimal", "tech-pro"];

      if (stage === "Student" || stage === "Fresher" || (expCount === 0 && projCount > 0)) {
        rec = "student";
        alt = ["tech-pro", "ats-professional"];
      } else if (stage === "Executive" || expCount >= 8) {
        rec = "executive";
        alt = ["ats-professional", "modern-minimal"];
      } else if (role.toLowerCase().includes("tech") || role.toLowerCase().includes("engineer") || projCount >= 3) {
        rec = "tech-pro";
        alt = ["ats-professional", "modern-minimal"];
      }

      return {
        recommendedTemplateId: rec,
        reason: `Selected '${rec}' to optimize visual hierarchy and highlight ${stage === "Student" ? "technical projects and academic coursework" : "verified industry progression and technical competencies"}.`,
        alternativeTemplates: alt,
      };
    },
  });
}
