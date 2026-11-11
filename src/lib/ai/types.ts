import { ResumeData } from "@/types/resume";

export interface AISummaryRequest {
  fullName?: string;
  targetRole?: string;
  experienceLevel?: string;
  currentSummary?: string;
  skills?: string[];
  jobDescription?: string;
  companyName?: string;
}

export interface AIBulletRequest {
  role?: string;
  roleTitle?: string;
  company?: string;
  companyName?: string;
  rawText?: string;
  rawDescription?: string;
  technologies?: string[];
  targetRole?: string;
  isInternship?: boolean;
}

export interface AIProjectRequest {
  projectName: string;
  rawDescription?: string;
  description?: string;
  technologies?: string[];
  targetRole?: string;
  readmeContent?: string;
  jobDescription?: string;
}

export interface AIJobAnalysisRequest {
  jobDescription: string;
  currentSkills?: string[];
  candidateSkills?: string[];
  targetRole?: string;
  companyName?: string;
  experienceSummary?: string;
  resumeData?: ResumeData;
}

export interface AIATSAnalysisRequest {
  resumeText?: string;
  targetRole?: string;
  jobDescription?: string;
  skills?: string[];
  resumeData?: ResumeData;
}

export interface AITemplateRecommendationRequest {
  targetRole: string;
  experienceLevel?: string;
  industry?: string;
  hasJobDescription?: boolean;
  resumeData?: ResumeData;
}
