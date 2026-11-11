import { ResumeData } from "@/types/resume";

export interface JobTailoringParams {
  targetRole?: string | null;
  companyName?: string | null;
  jobDescription?: string | null;
}

export function tailorResumeForJob(resume: ResumeData, params: JobTailoringParams): ResumeData {
  const { targetRole, companyName, jobDescription } = params;

  if (!targetRole && !jobDescription && !companyName) {
    return resume;
  }

  const jdText = (jobDescription || "").toLowerCase();
  const roleText = (targetRole || "").toLowerCase();

  // Extract key technology requirements from JD
  const targetKeywords: string[] = [];
  if (targetRole) {
    targetRole.split(/[\s,/]+/).filter((w) => w.length > 2).forEach((w) => targetKeywords.push(w.toLowerCase()));
  }
  if (jobDescription) {
    const terms = [
      "react", "next", "node", "typescript", "javascript", "python", "java", "sql",
      "postgres", "docker", "aws", "kubernetes", "fastapi", "django", "graphql", "tailwind"
    ];
    terms.forEach((t) => {
      if (jdText.includes(t)) targetKeywords.push(t);
    });
  }

  const cloned = JSON.parse(JSON.stringify(resume)) as ResumeData;

  // 1. Update Target Job & Headline
  if (targetRole) {
    cloned.targetJob.targetRole = targetRole;
    cloned.personal.headline = targetRole;
  }
  if (companyName) {
    cloned.targetJob.companyName = companyName;
  }
  if (jobDescription) {
    cloned.targetJob.jobDescription = jobDescription;
  }

  // 2. Re-prioritize confirmed skills matching the JD
  if (targetKeywords.length > 0) {
    const sortSkills = (skills: string[]) => {
      return [...skills].sort((a, b) => {
        const aMatch = targetKeywords.some((k) => a.toLowerCase().includes(k));
        const bMatch = targetKeywords.some((k) => b.toLowerCase().includes(k));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    };

    cloned.skills.languages = sortSkills(cloned.skills.languages);
    cloned.skills.frameworks = sortSkills(cloned.skills.frameworks);
    cloned.skills.databases = sortSkills(cloned.skills.databases);
    cloned.skills.tools = sortSkills(cloned.skills.tools);
    cloned.skills.cloud = sortSkills(cloned.skills.cloud);
  }

  // 3. Re-rank projects based on relevance to target keywords
  if (targetKeywords.length > 0 && cloned.projects.length > 1) {
    cloned.projects.sort((a, b) => {
      const aText = `${a.name} ${a.description} ${(a.technologies || []).join(" ")}`.toLowerCase();
      const bText = `${b.name} ${b.description} ${(b.technologies || []).join(" ")}`.toLowerCase();

      const aHits = targetKeywords.filter((k) => aText.includes(k)).length;
      const bHits = targetKeywords.filter((k) => bText.includes(k)).length;

      return bHits - aHits;
    });
  }

  return cloned;
}
