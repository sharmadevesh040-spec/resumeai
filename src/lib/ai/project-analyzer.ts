import { callGemini } from "./gemini";
import { PROJECT_ANALYZER_SYSTEM_PROMPT } from "./gemini-prompts";
import { SingleProjectAnalysisSchema, SingleProjectAnalysis } from "./gemini-schemas";
import { ScoredGitHubRepo } from "../import/github-service";

export interface ProjectAnalysisInput {
  name: string;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  stars?: number;
  forks?: number;
  readmeExcerpt?: string | null;
  targetRole?: string | null;
  jobDescription?: string | null;
}

/**
 * Analyzes a GitHub repository or project using Gemini to generate resume-ready title, overview, and bullets.
 */
export async function analyzeProjectWithGemini(
  input: ProjectAnalysisInput
): Promise<SingleProjectAnalysis> {
  const prompt = `
Analyze this project repository:
- Project Name: "${input.name}"
- Description: "${input.description || "No description provided"}"
- Primary Language: "${input.language || "TypeScript / Python"}"
- Repository Topics: ${input.topics && input.topics.length > 0 ? input.topics.join(", ") : "None specified"}
- GitHub Stars: ${input.stars || 0}, Forks: ${input.forks || 0}
- Target Role: "${input.targetRole || "Software Engineer"}"
${input.jobDescription ? `- Target Job Description: ${input.jobDescription.slice(0, 250)}` : ""}
- README Excerpt:
  """
  ${input.readmeExcerpt ? input.readmeExcerpt.slice(0, 1000) : "No README available"}
  """

Generate:
1. name: Clean, professional project title (e.g. format "ProjectName — Brief Tagline" or clean title).
2. overview: A punchy 1-sentence engineering summary explaining what the system does.
3. technologies: Array of verified technologies, frameworks, and databases used.
4. technicalContribution: Key architectural features implemented.
5. bullets: 2 to 4 bullet points detailing architecture, core engineering workflow, libraries integrated, and outcomes.
6. relevanceScore: Relevance rating (0-100) to the target role.
`;

  return callGemini<SingleProjectAnalysis>({
    systemInstruction: PROJECT_ANALYZER_SYSTEM_PROMPT,
    prompt,
    schema: SingleProjectAnalysisSchema,
    taskType: "standard",
    operationName: "project_analyzer",
    fallbackFn: () => {
      const tech = [input.language || "TypeScript", ...(input.topics || []).slice(0, 3)].filter(Boolean);
      return {
        name: input.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        overview: input.description || `Full-stack engineering application developed with ${tech.join(", ") || "modern web technologies"}.`,
        technologies: tech.length > 0 ? tech : ["TypeScript", "React", "Node.js"],
        technicalContribution: "Engineered core modules and client-server interactions.",
        bullets: [
          `Engineered an extensible application utilizing ${tech[0] || "modern software frameworks"} to provide modular application logic.`,
          `Designed clean API contracts and data models to manage state efficiently.`,
          `Configured automated builds and repository workflows for dependable code delivery.`,
        ],
        relevanceScore: (input.stars || 0) > 5 ? 90 : 80,
      };
    },
  });
}

/**
 * Batch analyzes a list of repositories, sorting them by relevance and generating complete project cards.
 */
export async function batchAnalyzeProjectsWithGemini(
  repos: ScoredGitHubRepo[],
  targetRole?: string | null,
  jobDescription?: string | null
): Promise<SingleProjectAnalysis[]> {
  const selectedRepos = repos.slice(0, 5);
  const results = await Promise.all(
    selectedRepos.map((repo) =>
      analyzeProjectWithGemini({
        name: repo.name,
        description: repo.description,
        language: repo.primaryLanguage,
        topics: repo.technologies,
        stars: repo.stars,
        forks: repo.forks,
        readmeExcerpt: repo.readmeExcerpt,
        targetRole,
        jobDescription,
      })
    )
  );

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
