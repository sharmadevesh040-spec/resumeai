/**
 * Unified AI Engine Facade
 * Bridges legacy API routes and tests directly to the centralized Gemini API modules.
 */
import {
  AISummaryRequest,
  AIBulletRequest,
  AIProjectRequest,
  AIJobAnalysisRequest,
  AIATSAnalysisRequest,
  AITemplateRecommendationRequest,
} from "./types";
import { generateProfessionalSummaryWithGemini, improveExperienceBulletsWithGemini } from "./content-optimizer";
import { analyzeProjectWithGemini } from "./project-analyzer";
import { analyzeJobWithGemini } from "./job-analyzer";
import { analyzeResumeATSWithGemini } from "./ats-analyzer";
import { ResumeData, TemplateId } from "@/types/resume";
import { sampleResumeData } from "@/lib/sample-data";

export async function improveSummary(req: AISummaryRequest) {
  const result = await generateProfessionalSummaryWithGemini({
    careerStage: req.experienceLevel,
    verifiedSkills: req.skills || [],
    targetRole: req.targetRole,
    companyName: req.companyName,
    jobDescription: req.jobDescription,
    recentExperience: req.currentSummary,
  });

  return {
    summary: result.summary,
    strengths: result.keyStrengths,
  };
}

export async function improveExperienceBullets(req: AIBulletRequest) {
  const role = req.role || req.roleTitle || "Software Engineer";
  const company = req.company || req.companyName || "Organization";
  const rawText = req.rawText || req.rawDescription || "";

  const result = await improveExperienceBulletsWithGemini({
    role,
    company,
    rawText,
    targetRole: req.targetRole,
    technologies: req.technologies,
    isInternship: req.isInternship,
  });

  return {
    bullets: result.bullets,
  };
}

export async function improveProjectBullets(req: AIProjectRequest) {
  const rawDesc = req.rawDescription || req.description || "";

  const result = await analyzeProjectWithGemini({
    name: req.projectName,
    description: rawDesc,
    topics: req.technologies,
    readmeExcerpt: req.readmeContent,
    targetRole: req.targetRole,
    jobDescription: req.jobDescription,
  });

  return {
    bullets: result.bullets,
    overview: result.overview,
    technologies: result.technologies,
  };
}

export async function analyzeJobDescription(req: AIJobAnalysisRequest) {
  const result = await analyzeJobWithGemini({
    jobDescription: req.jobDescription,
    targetRole: req.targetRole,
    companyName: req.companyName,
    candidateSkills: req.candidateSkills || req.currentSkills,
    candidateResume: req.resumeData,
  });

  return {
    jobMatchScore: result.overallMatchScore,
    skillsMatch: result.overallMatchScore,
    keywordMatch: result.overallMatchScore,
    experienceMatch: result.overallMatchScore,
    educationMatch: 85,
    requiredSkills: result.requiredSkills,
    preferredSkills: result.preferredSkills,
    missingCrucialSkills: result.missingSkills,
    identifiedKeywords: result.importantKeywords,
    jobSummary: `Role requirements for ${result.jobTitle}`,
    recommendations: result.recommendations,
  };
}

export async function calculateResumeATSScore(req: ResumeData | AIATSAnalysisRequest) {
  let resume: ResumeData;
  let targetRole: string | undefined;
  let jobDescription: string | undefined;

  if ("personal" in req && "experience" in req) {
    resume = req;
    targetRole = req.targetJob?.targetRole || req.personal?.headline;
    jobDescription = req.targetJob?.jobDescription;
  } else {
    resume = req.resumeData || sampleResumeData;
    targetRole = req.targetRole;
    jobDescription = req.jobDescription;
  }

  const result = await analyzeResumeATSWithGemini({
    resume,
    targetRole,
    jobDescription,
  });

  return {
    overallScore: result.overallScore,
    keywordMatch: result.keywordMatch,
    structure: result.structure,
    skills: result.skillsRelevance,
    experience: result.experienceRelevance,
    readability: result.readability,
    formatting: result.formatting,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    strengths: result.strengths,
    recommendations: result.recommendations,
    warnings: result.warnings,
  };
}

export function recommendTemplate(req: AITemplateRecommendationRequest) {
  const role = (req.targetRole || "").toLowerCase();
  const level = (req.experienceLevel || "").toLowerCase();

  let templateId: TemplateId = "ats-professional";
  if (level === "student" || role.includes("intern")) {
    templateId = "student";
  } else if (level === "0-2 years" || role.includes("software") || role.includes("engineer") || role.includes("developer")) {
    templateId = "tech-pro";
  } else if (level === "5+ years" || role.includes("lead") || role.includes("manager") || role.includes("director")) {
    templateId = "executive";
  }

  return {
    recommendedTemplate: templateId,
    templateId,
    reason: `Recommended '${templateId}' based on target role '${req.targetRole}' and career stage.`,
    alternatives: ["ats-professional", "modern-minimal", "tech-pro"] as TemplateId[],
  };
}
