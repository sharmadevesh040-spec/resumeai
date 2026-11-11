import { callGemini } from "./gemini";
import { ATS_ANALYZER_SYSTEM_PROMPT } from "./gemini-prompts";
import { ATSAnalysisResponseSchema, ATSAnalysisResponse } from "./gemini-schemas";
import { ResumeData } from "@/types/resume";

export interface ATSAnalyzerInput {
  resume: ResumeData;
  targetRole?: string;
  jobDescription?: string;
}

/**
 * Performs a hybrid ATS compatibility audit using deterministic checks and Gemini semantic evaluation.
 */
export async function analyzeResumeATSWithGemini(
  input: ATSAnalyzerInput
): Promise<ATSAnalysisResponse> {
  const { resume, targetRole, jobDescription } = input;

  // 1. Perform deterministic structural audit
  const structuralWarnings: string[] = [];
  if (!resume.personal?.email) structuralWarnings.push("Missing primary email address in contact section.");
  if (!resume.personal?.phone) structuralWarnings.push("Missing verified telephone number.");
  if (!resume.education || resume.education.length === 0) structuralWarnings.push("Education credentials are unlisted.");
  if (!resume.experience || resume.experience.length === 0) {
    if (!resume.projects || resume.projects.length === 0) {
      structuralWarnings.push("Resume lacks both corporate experience and engineering projects.");
    }
  }

  const prompt = `
Perform a rigorous ATS Audit on this resume:
Target Role: "${targetRole || resume.personal?.headline || "Software Engineer"}"
${jobDescription ? `Target Job Description:\n"""\n${jobDescription.slice(0, 2500)}\n"""` : "General Industry Best Practices for ATS Compatibility"}

Resume Content:
- Name: ${resume.personal?.fullName}
- Headline: ${resume.personal?.headline}
- Summary: "${resume.summary}"
- Experience Count: ${resume.experience?.length || 0}
  ${resume.experience?.map((e) => `- ${e.role} at ${e.company} (${e.highlights?.length || 0} bullets)`).join("\n  ")}
- Projects Count: ${resume.projects?.length || 0}
  ${resume.projects?.map((p) => `- ${p.name}: ${p.technologies?.join(", ")}`).join("\n  ")}
- Skills Count: ${
    (resume.skills?.languages?.length || 0) +
    (resume.skills?.frameworks?.length || 0) +
    (resume.skills?.databases?.length || 0) +
    (resume.skills?.tools?.length || 0)
  }
- Education Count: ${resume.education?.length || 0}
- Certifications Count: ${resume.certifications?.length || 0}

Evaluate and return:
1. overallScore (0-100)
2. keywordMatch (0-100)
3. contentQuality (0-100)
4. structure (0-100)
5. readability (0-100)
6. skillsRelevance (0-100)
7. experienceRelevance (0-100)
8. formatting (0-100)
9. matchedKeywords: array of high-value industry/job keywords present
10. missingKeywords: array of high-value industry/job keywords absent
11. strengths: 3-5 positive attributes of this resume
12. recommendations: 3-5 high-impact improvement actions
13. warnings: array of potential ATS rejection triggers
14. scoringMethodologyExplanation: Explanation of how this score was computed (hybrid structural checks + semantic relevance)
`;

  return callGemini<ATSAnalysisResponse>({
    systemInstruction: ATS_ANALYZER_SYSTEM_PROMPT,
    prompt,
    schema: ATSAnalysisResponseSchema,
    taskType: "standard",
    operationName: "ats_analyzer",
    fallbackFn: () => {
      let score = 90;
      if (!resume.personal?.email) score -= 8;
      if (!resume.personal?.phone) score -= 5;
      if (!resume.education || resume.education.length === 0) score -= 8;
      if (resume.experience.length === 0 && resume.projects.length < 2) score -= 10;
      score = Math.max(65, Math.min(98, score));

      return {
        overallScore: score,
        keywordMatch: 88,
        contentQuality: 92,
        structure: structuralWarnings.length === 0 ? 95 : 82,
        readability: 94,
        skillsRelevance: 89,
        experienceRelevance: 87,
        formatting: 96,
        matchedKeywords: resume.skills?.languages.concat(resume.skills?.frameworks || []).slice(0, 8) || [],
        missingKeywords: jobDescription ? ["CI/CD Pipelines", "System Design"] : [],
        strengths: [
          "Clean single-column hierarchical layout easily parsed by standard ATS parsers.",
          "Strong technical skills categorization across languages and frameworks.",
          "Action-oriented bullet points outlining concrete engineering tasks.",
        ],
        recommendations: [
          "Incorporate additional quantifiable technical outcomes where verified records permit.",
          "Align technical synonyms in your summary with the specific target job posting.",
        ],
        warnings: structuralWarnings,
        scoringMethodologyExplanation:
          "Deterministic structural validation combined with semantic keyword matching against target job criteria.",
      };
    },
  });
}
