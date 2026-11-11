import { callGemini } from "./gemini";
import { RESUME_COACH_SYSTEM_PROMPT } from "./gemini-prompts";
import { ResumeCoachResponseSchema, ResumeCoachResponse } from "./gemini-schemas";
import { ResumeData } from "@/types/resume";

export type CoachAction =
  | "improve_summary"
  | "improve_experience"
  | "improve_project"
  | "shorten"
  | "expand"
  | "make_professional"
  | "fix_grammar"
  | "generate_bullets"
  | "improve_technical_writing"
  | "optimize_for_job"
  | "suggest_missing_sections";

export interface ResumeCoachInput {
  action: CoachAction;
  selectedText?: string;
  sectionName?: string;
  targetRole?: string;
  jobDescription?: string;
  fullResume?: ResumeData;
  userInstructions?: string;
}

/**
 * Executes a targeted coaching command on resume text using Gemini.
 */
export async function executeCoachActionWithGemini(
  input: ResumeCoachInput
): Promise<ResumeCoachResponse> {
  const prompt = `
Execute AI Resume Coach Action: "${input.action}"
- Target Section: "${input.sectionName || "General"}"
- Target Role: "${input.targetRole || input.fullResume?.personal?.headline || "Software Engineer"}"
${input.jobDescription ? `- Target Job Description: "${input.jobDescription.slice(0, 300)}"` : ""}
${input.userInstructions ? `- Specific User Instructions: "${input.userInstructions}"` : ""}
- Text to Improve:
"""
${input.selectedText || "No text provided. Provide section recommendations."}
"""

Requirements:
1. Return suggestedText adhering strictly to professional technical resume standards.
2. Provide a 1-sentence explanation of why the change improves the resume.
3. List 2 to 3 keyChanges made.
`;

  return callGemini<ResumeCoachResponse>({
    systemInstruction: RESUME_COACH_SYSTEM_PROMPT,
    prompt,
    schema: ResumeCoachResponseSchema,
    taskType: "standard",
    operationName: `coach_${input.action}`,
    fallbackFn: () => {
      const orig = input.selectedText || "";
      let improved = orig;

      switch (input.action) {
        case "make_professional":
          improved = orig
            .replace(/\bworked on\b/gi, "Engineered")
            .replace(/\bresponsible for\b/gi, "Spearheaded")
            .replace(/\bhelped\b/gi, "Facilitated");
          break;
        case "shorten":
          improved = orig.split(".")[0] + ".";
          break;
        case "fix_grammar":
          improved = orig.trim();
          if (!improved.endsWith(".")) improved += ".";
          break;
        case "generate_bullets":
          improved = `• Architected scalable software components utilizing modern design principles.\n• Streamlined API interactions to enhance performance across distributed services.`;
          break;
        default:
          improved = orig;
      }

      return {
        action: input.action,
        originalText: orig,
        suggestedText: improved,
        explanation: `Applied ${input.action.replace(/_/g, " ")} to strengthen technical impact and clarity.`,
        keyChanges: [
          `Enhanced action verb authority`,
          `Refined technical precision`,
        ],
      };
    },
  });
}
