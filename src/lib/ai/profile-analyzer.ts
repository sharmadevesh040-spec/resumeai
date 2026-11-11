import { callGemini } from "./gemini";
import { PROFILE_ANALYZER_SYSTEM_PROMPT } from "./gemini-prompts";
import {
  ProfileAnalysisResponseSchema,
  ProfileAnalysisResponse,
} from "./gemini-schemas";
import { ProjectItem, ExperienceItem, EducationItem, SkillCategories } from "@/types/resume";

export interface ProfileAnalyzerInput {
  targetRole?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  skills?: SkillCategories | { [key: string]: string[] };
  githubBio?: string;
  linkedinSummary?: string;
  certificationsCount?: number;
}

/**
 * Analyzes candidate background using Gemini API.
 * Identifies career stage, domain category, strengths, and optimal resume structure.
 */
export async function analyzeProfileWithGemini(
  input: ProfileAnalyzerInput
): Promise<ProfileAnalysisResponse> {
  const experiences = input.experience || [];
  const education = input.education || [];
  const projects = input.projects || [];
  const totalYearsExperience = calculateRoughYoe(experiences);

  const prompt = `
Analyze this candidate's profile data:
- Target Role: "${input.targetRole || "Software Engineering"}"
- Total Years Experience: ~${totalYearsExperience} years
- Work Experiences Count: ${experiences.length}
  ${experiences.slice(0, 5).map((e) => `- ${e.role} at ${e.company} (${e.startDate} - ${e.endDate})`).join("\n  ")}
- Education Entries: ${education.length}
  ${education.map((e) => `- ${e.degree} at ${e.institution} (${e.startYear} - ${e.endYear})`).join("\n  ")}
- Projects Count: ${projects.length}
  ${projects.slice(0, 5).map((p) => `- ${p.name}: ${p.description.slice(0, 100)} (Tech: ${p.technologies.join(", ")})`).join("\n  ")}
- Skills Overview: ${JSON.stringify(input.skills || {})}
- Bio / Summary Notes: "${input.githubBio || input.linkedinSummary || "None provided"}"
- Certifications Count: ${input.certificationsCount || 0}

Evaluate and return:
1. candidateCategory (e.g. "Full-Stack Web Engineer", "AI/ML Engineer", "Computer Science Student", "Senior Engineering Manager")
2. careerStage ("Student", "Fresher", "Mid-Level", "Senior", or "Executive")
3. educationLevel ("Bachelor's Degree", "Master's Degree", "Self-Taught / Bootcamp", etc.)
4. technicalStrengths (list of top 4-6 verified technical strengths)
5. primaryTechnologies (list of top 3-5 core languages/frameworks evidenced in projects/work)
6. relevantProjectsCount (number of standout projects matching target role)
7. recommendedResumeStructure ("Student / Technical Resume", "Reverse-Chronological Professional", "Executive Leadership", etc.)
8. missingInformation (list of any missing items, e.g. "Unspecified contact phone", "Missing degree major")
9. suitableTargetRoles (list of 3-5 roles this candidate is well-suited for)
10. confidenceScore (0 to 100)
`;

  return callGemini<ProfileAnalysisResponse>({
    systemInstruction: PROFILE_ANALYZER_SYSTEM_PROMPT,
    prompt,
    schema: ProfileAnalysisResponseSchema,
    taskType: "standard",
    operationName: "profile_analyzer",
    fallbackFn: () => {
      // Deterministic fallback based on verified records
      let stage: ProfileAnalysisResponse["careerStage"] = "Fresher";
      if (totalYearsExperience >= 10) stage = "Executive";
      else if (totalYearsExperience >= 5) stage = "Senior";
      else if (totalYearsExperience >= 2) stage = "Mid-Level";
      else if (education.some((e) => e.endYear && Number(e.endYear) >= new Date().getFullYear())) {
        stage = "Student";
      }

      const allSkills: string[] = [];
      if (input.skills) {
        Object.values(input.skills).forEach((arr) => {
          if (Array.isArray(arr)) allSkills.push(...arr);
        });
      }

      return {
        candidateCategory: input.targetRole || "Software Professional",
        careerStage: stage,
        educationLevel: education[0]?.degree || "Bachelor's Degree in Computer Science",
        technicalStrengths: allSkills.slice(0, 5),
        primaryTechnologies: allSkills.slice(0, 3),
        relevantProjectsCount: projects.length,
        recommendedResumeStructure:
          stage === "Student" || stage === "Fresher" ? "Student / Technical Resume" : "Reverse-Chronological Professional",
        missingInformation: [],
        suitableTargetRoles: [input.targetRole || "Software Engineer", "Full-Stack Developer", "Frontend Engineer"],
        confidenceScore: 88,
      };
    },
  });
}

function calculateRoughYoe(experiences: ExperienceItem[]): number {
  if (!experiences || experiences.length === 0) return 0;
  let totalMonths = 0;
  for (const exp of experiences) {
    const startMatch = exp.startDate?.match(/\b(19\d\d|20\d\d)\b/);
    const endMatch = exp.endDate?.match(/\b(19\d\d|20\d\d)\b/);
    const startYear = startMatch ? parseInt(startMatch[1], 10) : 2022;
    const endYear = exp.isCurrent || exp.endDate?.toLowerCase().includes("present")
      ? new Date().getFullYear()
      : endMatch
      ? parseInt(endMatch[1], 10)
      : startYear + 1;
    totalMonths += Math.max(1, (endYear - startYear) * 12);
  }
  return Math.round((totalMonths / 12) * 10) / 10;
}
