export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photoUrl?: string;
  hideContactFields?: {
    phone?: boolean;
    location?: boolean;
    linkedin?: boolean;
    github?: boolean;
    portfolio?: boolean;
    photo?: boolean;
  };
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  coursework?: string;
  achievements?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  overview?: string;
  role?: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  projectType?: "Personal" | "Academic" | "Open Source" | "Commercial";
  highlights: string[];
}

export interface SkillCategories {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  cloud: string[];
  aiml: string[];
  softSkills: string[];
  other: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  organization?: string;
}

export interface ExtracurricularItem {
  id: string;
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface TargetJob {
  targetRole: string;
  companyName?: string;
  targetIndustry?: string;
  experienceLevel: "Student" | "Fresher" | "0-2 years" | "3-5 years" | "5+ years";
  jobDescription: string;
}

export type TemplateId =
  | "ats-professional"
  | "modern-minimal"
  | "tech-pro"
  | "student"
  | "executive"
  | "creative-pro";

export interface StyleSettings {
  templateId: TemplateId;
  font: "inter" | "merriweather" | "roboto" | "playfair" | "geist";
  fontSize: "sm" | "base" | "lg";
  accentColor: string;
  spacing: "compact" | "normal" | "relaxed";
  margins: "compact" | "normal" | "wide";
  sectionOrder: string[];
  showPhoto: boolean;
  layout?: "single" | "double";
}

export interface ATSBreakdown {
  overallScore: number;
  keywordMatch: number;
  structure: number;
  skills: number;
  experience: number;
  readability: number;
  formatting: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  warnings: string[];
}

export interface JobAnalysisResult {
  jobMatchScore: number;
  skillsMatch: number;
  keywordMatch: number;
  experienceMatch: number;
  educationMatch: number;
  requiredSkills: string[];
  preferredSkills: string[];
  missingCrucialSkills: string[];
  identifiedKeywords: string[];
  jobSummary: string;
  recommendations: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
  items?: string[];
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface ResumeData {
  id: string;
  userId?: string;
  title: string;
  targetJob: TargetJob;
  personal: PersonalInfo;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  internships?: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategories;
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  activities: ExtracurricularItem[];
  leadership?: ExtracurricularItem[];
  volunteer?: ExtracurricularItem[];
  publications?: PublicationItem[];
  coursework?: string[];
  awards?: AchievementItem[];
  customSections?: CustomSectionItem[];
  style: StyleSettings;
  atsAnalysis?: ATSBreakdown;
  jobAnalysis?: JobAnalysisResult;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}
