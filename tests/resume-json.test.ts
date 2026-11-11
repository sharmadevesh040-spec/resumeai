import { sampleResumeData } from "../src/lib/sample-data";
import { ResumeData } from "../src/types/resume";

export function testResumeJsonValidation() {
  console.log("▶ Running Resume JSON Validation Tests...");

  const resume: ResumeData = sampleResumeData;

  // 1. Personal Information validation
  if (!resume.personal.fullName || resume.personal.fullName !== "Devesh Sharma") {
    throw new Error("Validation Failed: Personal fullName mismatch");
  }
  if (!resume.personal.email.includes("@")) {
    throw new Error("Validation Failed: Invalid personal email");
  }

  // 2. Education validation
  if (!Array.isArray(resume.education) || resume.education.length === 0) {
    throw new Error("Validation Failed: Education must be a non-empty array");
  }
  if (resume.education[0].institution !== "Galgotias University") {
    throw new Error("Validation Failed: Expected Galgotias University in education");
  }

  // 3. Skills structure validation
  if (!resume.skills.languages || !resume.skills.languages.includes("Python")) {
    throw new Error("Validation Failed: Skills must include Python");
  }
  if (!resume.skills.frameworks || !resume.skills.frameworks.includes("React")) {
    throw new Error("Validation Failed: Skills must include React");
  }

  // 4. Projects validation
  if (!Array.isArray(resume.projects) || resume.projects.length < 2) {
    throw new Error("Validation Failed: Projects must contain at least 2 entries");
  }
  const farmingProject = resume.projects.find((p) => p.name.includes("Farming"));
  if (!farmingProject) {
    throw new Error("Validation Failed: Expected AI Farming Advisory Platform project");
  }

  // 5. Template & Style validation
  if (!resume.style.templateId) {
    throw new Error("Validation Failed: Template ID missing from style settings");
  }

  console.log("  ✔ Resume JSON Schema and Content Validated Successfully.");
}
