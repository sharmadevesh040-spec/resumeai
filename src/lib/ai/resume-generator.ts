import { callGemini } from "./gemini";
import { RESUME_GENERATOR_SYSTEM_PROMPT } from "./gemini-prompts";
import { FullResumeDataSchema } from "./gemini-schemas";
import {
  ResumeData,
  TemplateId,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  AchievementItem,
  ExtracurricularItem,
} from "@/types/resume";
import { GitHubImportResult } from "../import/github-service";
import { LinkedInParsedProfile } from "../import/linkedin-service";
import { DirectContactInput } from "../import/normalizer";
import { DocumentExtractedProfile } from "./gemini-schemas";
import { analyzeProfileWithGemini } from "./profile-analyzer";
import { categorizeSkillsWithGemini } from "./skills-analyzer";
import { generateProfessionalSummaryWithGemini, improveExperienceBulletsWithGemini } from "./content-optimizer";
import { batchAnalyzeProjectsWithGemini } from "./project-analyzer";
import { analyzeJobWithGemini } from "./job-analyzer";
import { analyzeResumeATSWithGemini } from "./ats-analyzer";
import { recommendTemplateWithGemini } from "./template-recommender";

function uuidv4(): string {
  return "item-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export interface GeminiResumeGenerationPayload {
  github?: GitHubImportResult;
  linkedin?: LinkedInParsedProfile;
  documentProfile?: DocumentExtractedProfile;
  directContact?: DirectContactInput;
  targetRole?: string | null;
  companyName?: string | null;
  jobDescription?: string | null;
  userId?: string;
}

export interface GeminiResumeGenerationOutput {
  resume: ResumeData;
  recommendedTemplate: TemplateId;
  recommendationReason: string;
  missingInformationWarnings: string[];
  sourcesUsed: {
    github: boolean;
    linkedin: boolean;
    document: boolean;
  };
}

/**
 * Complete End-to-End Professional Resume Generation Engine powered by Google Gemini API.
 */
export async function generateResumeWithGemini(
  payload: GeminiResumeGenerationPayload
): Promise<GeminiResumeGenerationOutput> {
  const { github, linkedin, documentProfile, directContact, targetRole, companyName, jobDescription, userId } = payload;
  const missingWarnings: string[] = [];

  const sourcesUsed = {
    github: Boolean(github && github.success && github.profile),
    linkedin: Boolean(
      linkedin &&
        ((linkedin.experiences && linkedin.experiences.length > 0) ||
          (linkedin.education && linkedin.education.length > 0) ||
          Boolean(linkedin.fullName && linkedin.summary))
    ),
    document: Boolean(
      documentProfile &&
        (documentProfile.experiences.length > 0 || documentProfile.education.length > 0 || Boolean(documentProfile.summary))
    ),
  };

  // 1. Resolve Identity and Contact Information
  const fullName =
    directContact?.fullName?.trim() ||
    linkedin?.fullName?.trim() ||
    documentProfile?.personal?.fullName?.trim() ||
    github?.profile?.name?.trim() ||
    github?.profile?.login ||
    "Professional Applicant";

  const headline =
    targetRole?.trim() ||
    linkedin?.headline?.trim() ||
    documentProfile?.personal?.headline?.trim() ||
    linkedin?.experiences?.[0]?.role ||
    documentProfile?.experiences?.[0]?.role ||
    github?.profile?.bio?.trim() ||
    "Professional";

  const email =
    directContact?.email?.trim() ||
    linkedin?.email ||
    documentProfile?.personal?.email ||
    github?.profile?.email ||
    "";
  if (!email) {
    missingWarnings.push("Email address is missing. Add your primary email in the personal info section.");
  }

  const phone =
    directContact?.phone?.trim() ||
    linkedin?.phone ||
    documentProfile?.personal?.phone ||
    "";
  if (!phone) {
    missingWarnings.push("Phone number is missing. Recruiters prefer a verified contact number.");
  }

  const location =
    directContact?.location?.trim() ||
    linkedin?.location ||
    documentProfile?.personal?.location ||
    github?.profile?.location ||
    "Remote / Available to Relocate";

  const linkedinUrl =
    linkedin?.linkedinUrl ||
    documentProfile?.personal?.linkedin ||
    "";

  const githubUrl =
    github?.profile?.htmlUrl ||
    (github?.username ? `https://github.com/${github.username}` : documentProfile?.personal?.github || "");

  const portfolio =
    github?.profile?.blog ||
    documentProfile?.personal?.portfolio ||
    "";

  // 2. Aggregate & Categorize Skills via Gemini Skills Analyzer
  const rawSkillsPool: string[] = [
    ...(github?.allDetectedLanguages || []),
    ...(github?.allDetectedTopics || []),
    ...(linkedin?.skills || []),
    ...(documentProfile?.skills || []),
  ];

  const categorizedSkills = await categorizeSkillsWithGemini(
    rawSkillsPool,
    targetRole,
    jobDescription
  );

  // 3. Analyze Projects via Gemini Project Analyzer
  let projects: ProjectItem[] = [];
  if (github && github.topRepositories && github.topRepositories.length > 0) {
    const analyzedProjects = await batchAnalyzeProjectsWithGemini(
      github.topRepositories,
      targetRole,
      jobDescription
    );

    projects = analyzedProjects.map((ap) => {
      const originalRepo = github.topRepositories.find((r) => r.name.toLowerCase() === ap.name.toLowerCase());
      return {
        id: uuidv4(),
        name: ap.name,
        overview: ap.overview,
        description: ap.overview,
        technologies: ap.technologies,
        highlights: ap.bullets,
        githubUrl: originalRepo?.githubUrl || (github.username ? `https://github.com/${github.username}/${ap.name}` : undefined),
        stars: originalRepo?.stars,
        forks: originalRepo?.forks,
      };
    });
  }

  // 4. Experience Normalization & Gemini Bullet Improvement
  const rawExperiences = [
    ...(linkedin?.experiences || []),
    ...(documentProfile?.experiences || []),
  ];

  const fulltimeExperiences: ExperienceItem[] = [];
  const internships: ExperienceItem[] = [];

  if (rawExperiences.length > 0) {
    const improvedExperiences = await Promise.all(
      rawExperiences.map(async (exp) => {
        const isIntern = Boolean(
          ("isInternship" in exp && exp.isInternship) ||
            exp.role.toLowerCase().includes("intern") ||
            exp.role.toLowerCase().includes("internship")
        );

        const improvedBullets = await improveExperienceBulletsWithGemini({
          role: exp.role,
          company: exp.company,
          rawText: exp.description,
          rawHighlights: exp.highlights,
          targetRole: targetRole || undefined,
          technologies: categorizedSkills.languages.concat(categorizedSkills.frameworks),
          isInternship: isIntern,
        });

        const item: ExperienceItem = {
          id: uuidv4(),
          company: exp.company,
          role: exp.role,
          location: exp.location || location,
          employmentType: isIntern ? "Internship" : "Full-time",
          startDate: exp.startDate || "2022",
          endDate: exp.endDate || "Present",
          isCurrent: Boolean(exp.isCurrent || exp.endDate?.toLowerCase().includes("present")),
          description: exp.description || "",
          highlights: improvedBullets.bullets,
        };

        return { item, isIntern };
      })
    );

    improvedExperiences.forEach(({ item, isIntern }) => {
      if (isIntern) internships.push(item);
      else fulltimeExperiences.push(item);
    });
  } else if (!sourcesUsed.linkedin && !sourcesUsed.document && sourcesUsed.github) {
    missingWarnings.push(
      "No corporate work experience imported. You can add prior roles in the Live Editor or highlight your GitHub projects."
    );
  }

  // 5. Education Normalization
  const education: EducationItem[] = [];
  if (directContact?.institution && directContact.institution.trim()) {
    education.push({
      id: uuidv4(),
      institution: directContact.institution.trim(),
      degree: directContact.degree?.trim() || "Bachelor's Degree",
      location: location,
      startYear: directContact.startYear?.trim() || "2020",
      endYear: directContact.endYear?.trim() || "2024",
    });
  } else if (linkedin && linkedin.education && linkedin.education.length > 0) {
    linkedin.education.forEach((edu) => {
      education.push({
        id: uuidv4(),
        institution: edu.institution,
        degree: edu.degree && edu.degree !== "-" ? edu.degree : "Degree Program",
        location: location,
        startYear: edu.startYear || "2018",
        endYear: edu.endYear || "2022",
        coursework: edu.coursework || (edu.fieldOfStudy ? `Major in ${edu.fieldOfStudy}` : undefined),
      });
    });
  } else if (documentProfile && documentProfile.education && documentProfile.education.length > 0) {
    documentProfile.education.forEach((edu) => {
      education.push({
        id: uuidv4(),
        institution: edu.institution,
        degree: edu.degree || "Degree Program",
        location: location,
        startYear: edu.startYear || "2018",
        endYear: edu.endYear || "2022",
        coursework: edu.fieldOfStudy ? `Major in ${edu.fieldOfStudy}` : undefined,
      });
    });
  } else {
    missingWarnings.push(
      "Education details could not be retrieved automatically. Please verify your institution and graduation year."
    );
  }

  // 6. Certifications & Achievements
  const certifications: CertificationItem[] = [
    ...(linkedin?.certifications || []),
    ...(documentProfile?.certifications || []),
  ].map((name) => ({
    id: uuidv4(),
    name,
    issuer: "Verified Credential",
    issueDate: "2023",
  }));

  const achievements: AchievementItem[] = [
    ...(linkedin?.honors || []),
    ...(documentProfile?.achievements || []),
  ].map((title) => ({
    id: uuidv4(),
    title,
    description: "Recognized for technical excellence and domain contributions.",
  }));

  const highStarRepo = github?.topRepositories?.find((r) => r.stars >= 5);
  if (highStarRepo) {
    achievements.push({
      id: uuidv4(),
      title: `Open Source Contributor (${highStarRepo.stars}+ GitHub Stars)`,
      description: `Author and maintainer of ${highStarRepo.name}, adopted by developers in the open-source community.`,
    });
  }

  // 7. Profile Analysis via Gemini
  const allVerifiedSkills = [
    ...categorizedSkills.languages,
    ...categorizedSkills.frameworks,
    ...categorizedSkills.databases,
    ...categorizedSkills.tools,
  ];

  const profileAnalysis = await analyzeProfileWithGemini({
    targetRole: targetRole || headline,
    experience: fulltimeExperiences.concat(internships),
    education,
    projects,
    skills: categorizedSkills,
    githubBio: github?.profile?.bio || undefined,
    linkedinSummary: linkedin?.summary || documentProfile?.summary || undefined,
    certificationsCount: certifications.length,
  });

  // 8. Professional Summary Generation via Gemini
  const summaryResult = await generateProfessionalSummaryWithGemini({
    careerStage: profileAnalysis.careerStage,
    verifiedSkills: allVerifiedSkills,
    targetRole: targetRole || headline,
    companyName: companyName || undefined,
    jobDescription: jobDescription || undefined,
    recentExperience: fulltimeExperiences[0] ? `${fulltimeExperiences[0].role} at ${fulltimeExperiences[0].company}` : undefined,
    topProjects: projects.slice(0, 3).map((p) => p.name),
  });

  // 9. Template Recommendation via Gemini
  const templateResult = await recommendTemplateWithGemini({
    careerStage: profileAnalysis.careerStage,
    targetRole: targetRole || headline,
    experienceCount: fulltimeExperiences.length + internships.length,
    projectCount: projects.length,
  });

  // Map recommendedTemplateId to TemplateId type
  let templateId: TemplateId = templateResult.recommendedTemplateId as TemplateId;
  if (templateId === ("creative" as any)) {
    templateId = "creative-pro";
  }

  // Determine section order based on career stage
  const isStudentOrFresher = profileAnalysis.careerStage === "Student" || profileAnalysis.careerStage === "Fresher";
  const sectionOrder = isStudentOrFresher
    ? ["summary", "education", "projects", "skills", "experience", "certifications", "achievements"]
    : ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"];

  // 10. Construct Candidate Resume Data Object
  const resume: ResumeData = {
    id: "resume-" + Date.now(),
    userId: userId || undefined,
    title: `${fullName} — ${targetRole || headline}`,
    targetJob: {
      targetRole: targetRole || headline,
      companyName: companyName || undefined,
      experienceLevel:
        profileAnalysis.careerStage === "Student"
          ? "Student"
          : profileAnalysis.careerStage === "Fresher"
          ? "Fresher"
          : profileAnalysis.careerStage === "Mid-Level"
          ? "0-2 years"
          : profileAnalysis.careerStage === "Senior"
          ? "3-5 years"
          : "5+ years",
      jobDescription: jobDescription || "",
    },
    personal: {
      fullName,
      headline,
      email,
      phone,
      location,
      linkedin: linkedinUrl,
      github: githubUrl,
      portfolio,
    },
    summary: summaryResult.summary,
    education,
    experience: fulltimeExperiences,
    internships: internships.length > 0 ? internships : undefined,
    projects,
    skills: {
      languages: categorizedSkills.languages,
      frameworks: categorizedSkills.frameworks,
      databases: categorizedSkills.databases,
      tools: categorizedSkills.tools,
      cloud: categorizedSkills.cloud || [],
      aiml: categorizedSkills.aiml || [],
      softSkills: categorizedSkills.softSkills || [],
      other: categorizedSkills.other || [],
    },
    certifications,
    achievements,
    activities: [],
    style: {
      templateId,
      font: "inter",
      fontSize: "base",
      accentColor: "#4f46e5",
      spacing: "normal",
      margins: "normal",
      sectionOrder,
      showPhoto: false,
    },
  };

  // 11. ATS Analysis & Job Analysis via Gemini
  const atsResult = await analyzeResumeATSWithGemini({
    resume,
    targetRole: targetRole || headline,
    jobDescription: jobDescription || undefined,
  });

  resume.atsAnalysis = {
    overallScore: atsResult.overallScore,
    keywordMatch: atsResult.keywordMatch,
    structure: atsResult.structure,
    skills: atsResult.skillsRelevance,
    experience: atsResult.experienceRelevance,
    readability: atsResult.readability,
    formatting: atsResult.formatting,
    matchedKeywords: atsResult.matchedKeywords,
    missingKeywords: atsResult.missingKeywords,
    strengths: atsResult.strengths,
    recommendations: atsResult.recommendations,
    warnings: atsResult.warnings.concat(missingWarnings),
  };

  if (jobDescription) {
    const jobResult = await analyzeJobWithGemini({
      jobDescription,
      targetRole: targetRole || headline,
      companyName: companyName || undefined,
      candidateSkills: allVerifiedSkills,
      candidateResume: resume,
    });

    resume.jobAnalysis = {
      jobMatchScore: jobResult.overallMatchScore,
      skillsMatch: jobResult.overallMatchScore,
      keywordMatch: jobResult.overallMatchScore,
      experienceMatch: jobResult.overallMatchScore,
      educationMatch: 85,
      requiredSkills: jobResult.requiredSkills,
      preferredSkills: jobResult.preferredSkills,
      missingCrucialSkills: jobResult.missingSkills,
      identifiedKeywords: jobResult.importantKeywords,
      jobSummary: `Role requirements for ${jobResult.jobTitle}`,
      recommendations: jobResult.recommendations,
    };
  }

  return {
    resume,
    recommendedTemplate: templateId,
    recommendationReason: templateResult.reason,
    missingInformationWarnings: missingWarnings,
    sourcesUsed,
  };
}
