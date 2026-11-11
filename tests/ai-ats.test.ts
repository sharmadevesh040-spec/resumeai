import {
  improveSummary,
  improveExperienceBullets,
  calculateResumeATSScore,
  analyzeJobDescription,
  recommendTemplate,
} from "../src/lib/ai/engine";
import { sampleResumeData } from "../src/lib/sample-data";

export async function testAiAndAtsAnalysis() {
  console.log("▶ Running AI Engine & ATS Compatibility Tests...");

  // 1. Test Summary Improvement
  const summaryResult = await improveSummary({
    targetRole: "Software Developer Intern",
    skills: ["Python", "React", "SQL"],
    currentSummary: "I am a computer science student who likes web dev.",
  });

  if (!summaryResult.summary || summaryResult.summary.length < 20) {
    throw new Error("AI Summary test failed: Summary output too short");
  }

  // 2. Test Experience Bullet Optimization
  const bulletResult = await improveExperienceBullets({
    role: "Software Engineering Intern",
    company: "Nexus Technologies",
    rawText: "worked on website and fixed some database bugs",
    technologies: ["React", "SQL"],
    targetRole: "Software Developer",
  });

  if (!bulletResult.bullets || bulletResult.bullets.length === 0) {
    throw new Error("AI Bullet test failed: Empty bullets returned");
  }

  // 3. Test ATS Scoring Module
  const atsResult = await calculateResumeATSScore(sampleResumeData);
  if (atsResult.overallScore < 70 || atsResult.overallScore > 100) {
    throw new Error(`ATS Score out of bounds: ${atsResult.overallScore}`);
  }
  if (!atsResult.matchedKeywords || atsResult.matchedKeywords.length === 0) {
    throw new Error("ATS Score missing matched keywords");
  }

  // 4. Test Job Description Analysis
  const jobResult = await analyzeJobDescription({
    jobDescription: "Looking for a Software Engineer proficient in React, Python, and SQL.",
    currentSkills: ["Python", "React", "SQL", "Git"],
    targetRole: "Software Engineer",
  });

  if (jobResult.jobMatchScore < 50 || !jobResult.requiredSkills.length) {
    throw new Error("Job Analysis test failed");
  }

  // 5. Test Template Recommendation
  const techRec = recommendTemplate({
    targetRole: "Software Engineer",
    experienceLevel: "0-2 years",
  });
  if (techRec.recommendedTemplate !== "tech-pro") {
    throw new Error(`Expected tech-pro recommendation, got ${techRec.recommendedTemplate}`);
  }

  const studentRec = recommendTemplate({
    targetRole: "Software Intern",
    experienceLevel: "Student",
  });
  if (studentRec.recommendedTemplate !== "student") {
    throw new Error(`Expected student recommendation, got ${studentRec.recommendedTemplate}`);
  }

  console.log("  ✔ AI Engine, ATS Scoring, and Job Match Analysis passed successfully.");
}
