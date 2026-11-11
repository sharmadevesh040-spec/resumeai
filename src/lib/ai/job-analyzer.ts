import { callGemini } from "./gemini";
import { JOB_ANALYZER_SYSTEM_PROMPT } from "./gemini-prompts";
import { JobAnalysisResponseSchema, JobAnalysisResponse } from "./gemini-schemas";
import { ResumeData } from "@/types/resume";

export interface JobAnalyzerInput {
  jobDescription: string;
  targetRole?: string;
  companyName?: string;
  candidateSkills?: string[];
  candidateResume?: ResumeData;
}

/**
 * Analyzes a target job description and compares it against candidate background using Gemini.
 */
export async function analyzeJobWithGemini(
  input: JobAnalyzerInput
): Promise<JobAnalysisResponse> {
  // Collect candidate skills from resume or input
  const allCandidateSkills: string[] = input.candidateSkills || [];
  if (input.candidateResume?.skills) {
    const s = input.candidateResume.skills;
    allCandidateSkills.push(
      ...s.languages,
      ...s.frameworks,
      ...s.databases,
      ...s.tools,
      ...(s.aiml || []),
      ...(s.cloud || [])
    );
  }

  const prompt = `
Analyze this Target Job Description:
- Target Job Title: "${input.targetRole || "Software Engineer"}"
- Target Company: "${input.companyName || "Employer"}"
- Job Description Text:
  """
  ${input.jobDescription.slice(0, 3000)}
  """

Candidate Verified Background:
- Verified Skills: ${JSON.stringify(Array.from(new Set(allCandidateSkills)))}
- Candidate Experiences Count: ${input.candidateResume?.experience.length || 0}
- Candidate Projects Count: ${input.candidateResume?.projects.length || 0}

Evaluate and return:
1. jobTitle: Official parsed job title.
2. requiredSkills: Array of must-have technical qualifications.
3. preferredSkills: Array of bonus/preferred skills.
4. importantKeywords: Key industry terminology and concepts.
5. responsibilities: Core expected day-to-day responsibilities.
6. matchedSkills: Verified candidate skills that directly align with requirements.
7. partiallyMatchedSkills: Foundational candidate skills closely related to requirements.
8. missingSkills: High-priority job requirements not evidenced in candidate data.
9. relevantExperienceMatches: Specific roles or projects that align with the job responsibilities.
10. recommendations: 3 to 5 actionable suggestions to legitimately highlight existing matching experience.
11. overallMatchScore: Match percentage (0 to 100) calculated from keyword and skill coverage.
`;

  return callGemini<JobAnalysisResponse>({
    systemInstruction: JOB_ANALYZER_SYSTEM_PROMPT,
    prompt,
    schema: JobAnalysisResponseSchema,
    taskType: "standard",
    operationName: "job_analyzer",
    fallbackFn: () => {
      // Deterministic fallback matching
      const jdLower = input.jobDescription.toLowerCase();
      const matched = allCandidateSkills.filter((s) => jdLower.includes(s.toLowerCase()));
      const commonTech = ["react", "typescript", "python", "docker", "aws", "sql", "node.js", "kubernetes", "graphql", "ci/cd"];
      const missing = commonTech.filter((t) => jdLower.includes(t) && !matched.some((m) => m.toLowerCase().includes(t)));

      const score = Math.min(95, Math.max(50, Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100)));

      return {
        jobTitle: input.targetRole || "Software Engineer",
        requiredSkills: matched.slice(0, 5).concat(missing.slice(0, 2)),
        preferredSkills: missing.slice(2, 5),
        importantKeywords: ["Architecture", "Scalability", "Agile", "APIs", "Testing"],
        responsibilities: [
          "Develop and maintain production web services and user interfaces.",
          "Collaborate with engineering teams on feature implementation and system architecture.",
          "Participate in code reviews and uphold engineering standards.",
        ],
        matchedSkills: matched,
        partiallyMatchedSkills: [],
        missingSkills: missing,
        relevantExperienceMatches: ["Aligned technical projects and repository demonstrations."],
        recommendations: [
          "Emphasize your matched core technical proficiencies in the Professional Summary.",
          "Highlight relevant project architectures that mirror the target role's tech stack.",
          "Address required qualifications directly in project bullets without inventing unverified claims.",
        ],
        overallMatchScore: score,
      };
    },
  });
}
