import { z } from "zod";
import { TemplateId } from "@/types/resume";

/**
 * Standard Zod schemas for structured Gemini JSON responses.
 * Enforces rigorous type validation and semantic integrity across all AI features.
 */

// 1. Personal Info Schema
export const PersonalInfoSchema = z.object({
  fullName: z.string().default("Job Applicant"),
  headline: z.string().default("Professional"),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional().default(""),
  github: z.string().optional().default(""),
  portfolio: z.string().optional().default(""),
});

// 2. Experience Entry Schema
export const ExperienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  location: z.string().optional().default(""),
  employmentType: z.enum(["Full-time", "Part-time", "Internship", "Contract", "Freelance"]).default("Full-time"),
  startDate: z.string().default(""),
  endDate: z.string().default("Present"),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().default(""),
  highlights: z.array(z.string()).default([]),
});

// 3. Education Entry Schema
export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  location: z.string().optional().default(""),
  startYear: z.string().default(""),
  endYear: z.string().default(""),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
});

// 4. Project Entry Schema
export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  stars: z.number().optional(),
  forks: z.number().optional(),
});

// 5. Skills Taxonomy Schema (9 comprehensive categories)
export const SkillsTaxonomySchema = z.object({
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  libraries: z.array(z.string()).optional().default([]),
  databases: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  cloud: z.array(z.string()).optional().default([]),
  aiml: z.array(z.string()).optional().default([]),
  coreCs: z.array(z.string()).optional().default([]),
  softSkills: z.array(z.string()).optional().default([]),
  other: z.array(z.string()).optional().default([]),
});

// 6. Complete Structured Resume Schema
export const FullResumeDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().default("Professional Resume"),
  personal: PersonalInfoSchema,
  summary: z.string().default(""),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  skills: SkillsTaxonomySchema,
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().optional().default(""),
    expiryDate: z.string().optional(),
    credentialUrl: z.string().optional(),
  })).default([]),
  achievements: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.string().optional(),
  })).default([]),
  activities: z.array(z.object({
    id: z.string(),
    role: z.string(),
    organization: z.string(),
    description: z.string(),
    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),
  })).default([]),
  style: z.object({
    template: z.enum([
      "ats-professional",
      "modern-minimal",
      "tech-pro",
      "student",
      "executive",
      "creative",
    ]).default("ats-professional"),
    fontSize: z.enum(["small", "medium", "large"]).default("medium"),
    colorScheme: z.string().default("slate"),
    fontFamily: z.string().default("Inter"),
    spacing: z.enum(["compact", "normal", "spacious"]).default("normal"),
    sectionOrder: z.array(z.string()).default([
      "summary",
      "experience",
      "projects",
      "skills",
      "education",
      "certifications",
      "achievements",
    ]),
  }).default({
    template: "ats-professional",
    fontSize: "medium",
    colorScheme: "slate",
    fontFamily: "Inter",
    spacing: "normal",
    sectionOrder: [
      "summary",
      "experience",
      "projects",
      "skills",
      "education",
      "certifications",
      "achievements",
    ],
  }),
});

// 7. Profile Analysis Schema
export const ProfileAnalysisResponseSchema = z.object({
  candidateCategory: z.string(),
  careerStage: z.enum(["Student", "Fresher", "Mid-Level", "Senior", "Executive"]),
  educationLevel: z.string(),
  technicalStrengths: z.array(z.string()),
  primaryTechnologies: z.array(z.string()),
  relevantProjectsCount: z.number(),
  recommendedResumeStructure: z.string(),
  missingInformation: z.array(z.string()),
  suitableTargetRoles: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
});

// 8. Professional Summary Schema
export const ProfessionalSummaryResponseSchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    return { summary: val, keyStrengths: [], targetRoleAlignment: "" };
  }
  if (val && typeof val === "object") {
    const summary = val.summary || val.professionalSummary || val.text || val.content || "";
    return {
      ...val,
      summary,
    };
  }
  return val;
}, z.object({
  summary: z.string().min(10),
  keyStrengths: z.array(z.string()).default([]),
  targetRoleAlignment: z.string().default(""),
}));

// 9. Experience Bullet Improvement Schema
export const ExperienceBulletsResponseSchema = z.preprocess((val: any) => {
  if (Array.isArray(val)) {
    return { bullets: val, actionVerbsUsed: [], quantifiedOutcomesIdentified: false };
  }
  return val;
}, z.object({
  bullets: z.array(z.string().min(10)).min(1),
  actionVerbsUsed: z.array(z.string()).default([]),
  quantifiedOutcomesIdentified: z.boolean().default(false),
}));

// 10. Project Analysis Schema
export const SingleProjectAnalysisSchema = z.preprocess((val: any) => {
  if (val && typeof val === "object") {
    if (Array.isArray(val.technicalContribution)) {
      val.technicalContribution = val.technicalContribution.join("; ");
    }
  }
  return val;
}, z.object({
  name: z.string(),
  overview: z.string(),
  technologies: z.array(z.string()),
  technicalContribution: z.string().default("Engineered core modules and client-server interactions."),
  bullets: z.array(z.string()),
  relevanceScore: z.number().min(0).max(100).default(80),
}));

// 11. Job Description Analysis Schema
export const JobAnalysisResponseSchema = z.object({
  jobTitle: z.string(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  importantKeywords: z.array(z.string()),
  responsibilities: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  partiallyMatchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  relevantExperienceMatches: z.array(z.string()).default([]),
  recommendations: z.array(z.string()),
  overallMatchScore: z.number().min(0).max(100),
});

// 12. ATS Compatibility Analysis Schema
export const ATSAnalysisResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  keywordMatch: z.number().min(0).max(100),
  contentQuality: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
  skillsRelevance: z.number().min(0).max(100),
  experienceRelevance: z.number().min(0).max(100),
  formatting: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
  warnings: z.array(z.string()).default([]),
  scoringMethodologyExplanation: z.string(),
});

// 13. Template Recommendation Schema
export const TemplateRecommendationResponseSchema = z.object({
  recommendedTemplateId: z.enum([
    "ats-professional",
    "modern-minimal",
    "tech-pro",
    "student",
    "executive",
    "creative",
    "creative-pro",
  ]),
  reason: z.string(),
  alternativeTemplates: z.array(z.enum([
    "ats-professional",
    "modern-minimal",
    "tech-pro",
    "student",
    "executive",
    "creative",
    "creative-pro",
  ])),
});

// 14. AI Resume Coach Action Schema
export const ResumeCoachResponseSchema = z.object({
  action: z.string(),
  originalText: z.string(),
  suggestedText: z.string(),
  explanation: z.string(),
  keyChanges: z.array(z.string()),
});

// 15. Extracted Profile Document Schema (PDF / Document parsing)
export const DocumentExtractedProfileSchema = z.object({
  personal: z.object({
    fullName: z.string().optional().default(""),
    headline: z.string().optional().default(""),
    email: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    location: z.string().optional().default(""),
    linkedin: z.string().optional().default(""),
    github: z.string().optional().default(""),
    portfolio: z.string().optional().default(""),
  }),
  summary: z.string().optional().default(""),
  experiences: z.array(z.object({
    role: z.string(),
    company: z.string(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional().default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional(),
    startYear: z.string().optional(),
    endYear: z.string().optional(),
    gpa: z.string().optional(),
  })).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
});

export type FullResumeData = z.infer<typeof FullResumeDataSchema>;
export type ProfileAnalysisResponse = z.infer<typeof ProfileAnalysisResponseSchema>;
export type ProfessionalSummaryResponse = z.infer<typeof ProfessionalSummaryResponseSchema>;
export type ExperienceBulletsResponse = z.infer<typeof ExperienceBulletsResponseSchema>;
export type SingleProjectAnalysis = z.infer<typeof SingleProjectAnalysisSchema>;
export type JobAnalysisResponse = z.infer<typeof JobAnalysisResponseSchema>;
export type ATSAnalysisResponse = z.infer<typeof ATSAnalysisResponseSchema>;
export type TemplateRecommendationResponse = z.infer<typeof TemplateRecommendationResponseSchema>;
export type ResumeCoachResponse = z.infer<typeof ResumeCoachResponseSchema>;
export type DocumentExtractedProfile = z.infer<typeof DocumentExtractedProfileSchema>;
