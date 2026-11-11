import { CareerStage, DomainPersona } from "./profile-analyzer";

export interface SummaryGeneratorInput {
  careerStage: CareerStage;
  yearsOfExperience: number;
  domainPersona: DomainPersona;
  targetRole?: string | null;
  companyName?: string | null;
  keySkills: string[];
  educationMajor?: string | null;
  highStarRepoName?: string | null;
  highStarCount?: number;
  existingSummary?: string | null;
}

export function generateProfessionalSummary(input: SummaryGeneratorInput): string {
  const {
    careerStage,
    yearsOfExperience,
    domainPersona,
    targetRole,
    companyName,
    keySkills,
    educationMajor,
    highStarRepoName,
    highStarCount,
    existingSummary,
  } = input;

  // If user provided an existing summary of strong substance (>60 chars), refine and preserve it
  if (existingSummary && existingSummary.trim().length > 60 && !existingSummary.toLowerCase().includes("hardworking")) {
    return existingSummary.trim();
  }

  const roleName = targetRole?.trim() || getPersonaRoleTitle(domainPersona);
  const primarySkillsStr = keySkills.slice(0, 4).join(", ") || "modern software engineering stacks";
  const targetCompanyPhrase = companyName?.trim() ? ` with high-impact applications at ${companyName.trim()}` : "";

  // 1. Fresher / Student Profile
  if (careerStage === "student" || careerStage === "fresher") {
    const majorStr = educationMajor || "Computer Science and Engineering";
    const projectProof = highStarRepoName && highStarCount
      ? ` Author of open-source project ${highStarRepoName} (${highStarCount}+ GitHub stars).`
      : "";

    return (
      `Motivated ${majorStr} graduate specializing in ${roleName}, equipped with strong foundations in ${primarySkillsStr}. ` +
      `Proven hands-on experience developing responsive web applications, robust RESTful APIs, and version-controlled software architecture.${projectProof} ` +
      `Eager to contribute technical rigor, proactive problem-solving, and clean coding standards in fast-paced engineering environments${targetCompanyPhrase}.`
    );
  }

  // 2. Early-Career Professional (1-2 years)
  if (careerStage === "early_career") {
    const yoePhrase = yearsOfExperience > 0 ? `${yearsOfExperience}+ years of practical experience` : "proven production experience";
    return (
      `Results-oriented ${roleName} with ${yoePhrase} designing, maintaining, and deploying scalable software systems utilizing ${primarySkillsStr}. ` +
      `Demonstrated capability across end-to-end development cycles, collaborative agile workflows, and test-driven code execution. ` +
      `Committed to delivering resilient, user-centered digital solutions that align technical architecture with strategic business goals${targetCompanyPhrase}.`
    );
  }

  // 3. Lead / Executive Profile
  if (careerStage === "lead_executive") {
    const yoePhrase = yearsOfExperience >= 5 ? `${Math.floor(yearsOfExperience)}+ years of leadership` : "extensive technical leadership";
    return (
      `Strategic ${roleName} with ${yoePhrase} architecting enterprise distributed systems, scaling engineering platforms, and steering high-performance teams. ` +
      `Deep expertise encompassing ${primarySkillsStr}, system reliability engineering, and agile operational excellence. ` +
      `Recognized for driving technical roadmaps, mentoring senior talent, and delivering high-availability cloud infrastructure with measurable performance gains${targetCompanyPhrase}.`
    );
  }

  // 4. Experienced Professional (Mid to Senior)
  const yoePhrase = yearsOfExperience >= 3 ? `${Math.floor(yearsOfExperience)}+ years of professional experience` : "proven expertise";
  return (
    `Accomplished ${roleName} with ${yoePhrase} building robust, maintainable applications and high-throughput services leveraging ${primarySkillsStr}. ` +
    `Adept at translating complex system requirements into modular architectures, optimizing runtime performance, and ensuring rigorous automated test coverage. ` +
    `Dedicated to continuous code craftsmanship, cross-functional collaboration, and delivering scalable engineering outcomes${targetCompanyPhrase}.`
  );
}

function getPersonaRoleTitle(persona: DomainPersona): string {
  switch (persona) {
    case "aiml":
      return "AI / Machine Learning Engineer";
    case "data_analyst":
      return "Data Analyst & Business Intelligence Specialist";
    case "devops":
      return "DevOps & Cloud Infrastructure Engineer";
    case "frontend":
      return "Frontend Software Engineer";
    case "backend":
      return "Backend Systems Engineer";
    case "creative_ux":
      return "UI/UX Product Designer";
    case "fullstack":
    default:
      return "Full-Stack Software Engineer";
  }
}
