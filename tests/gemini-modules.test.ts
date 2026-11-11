import assert from "assert";
import {
  getGeminiConfig,
  getModelForTask,
  recordGeminiUsage,
  getGeminiUsageLog,
} from "../src/lib/ai/gemini-config";
import { callGemini, callGeminiText } from "../src/lib/ai/gemini";
import { analyzeProfileWithGemini } from "../src/lib/ai/profile-analyzer";
import {
  generateProfessionalSummaryWithGemini,
  improveExperienceBulletsWithGemini,
  rewriteContentWithGemini,
} from "../src/lib/ai/content-optimizer";
import {
  analyzeProjectWithGemini,
  batchAnalyzeProjectsWithGemini,
} from "../src/lib/ai/project-analyzer";
import { categorizeAndDeduplicateSkillsWithGemini } from "../src/lib/ai/skills-analyzer";
import { analyzeJobWithGemini } from "../src/lib/ai/job-analyzer";
import { analyzeResumeATSWithGemini } from "../src/lib/ai/ats-analyzer";
import { recommendTemplateWithGemini } from "../src/lib/ai/template-recommender";
import { executeCoachActionWithGemini } from "../src/lib/ai/resume-coach";
import { extractProfileFromDocumentWithGemini } from "../src/lib/ai/document-analyzer";
import { generateResumeWithGemini } from "../src/lib/ai/resume-generator";
import { ResumeData } from "../src/types/resume";
import { z } from "zod";

export async function testGeminiModulesSuite(): Promise<void> {
  console.log("▶ Running Dedicated Google Gemini API Architecture Tests...");

  // 1. Gemini Config & Token Telemetry
  const config = getGeminiConfig();
  assert.ok(config.defaultModel, "Default Gemini model must be configured");
  assert.ok(config.complexModel, "Complex Gemini model must be configured");
  assert.strictEqual(getModelForTask("complex"), config.complexModel);
  assert.strictEqual(getModelForTask("standard"), config.defaultModel);
  assert.strictEqual(getModelForTask("fast"), config.defaultModel);

  const initialLogCount = getGeminiUsageLog().length;
  recordGeminiUsage({
    operation: "unit_test_op",
    model: config.defaultModel,
    promptTokens: 120,
    candidateTokens: 80,
    totalTokens: 200,
    durationMs: 45,
  });
  const updatedLog = getGeminiUsageLog();
  assert.strictEqual(updatedLog.length, initialLogCount + 1, "Token usage record must be appended to rolling log");
  assert.strictEqual(updatedLog[updatedLog.length - 1].totalTokens, 200);
  console.log("  ✔ Gemini Configuration & Usage Telemetry verified.");

  // 2. Core Gemini Engine Fallback & Schema Validation
  const testSchema = z.object({
    status: z.string(),
    count: z.number(),
  });

  const fallbackResult = await callGemini({
    prompt: "Test query",
    schema: testSchema,
    operationName: "test_call",
    fallbackFn: () => ({ status: "ok", count: 42 }),
  });
  assert.strictEqual(fallbackResult.status, "ok");
  assert.strictEqual(fallbackResult.count, 42);

  const fallbackTextResult = await callGeminiText({
    prompt: "Test text query",
    operationName: "test_text_call",
    fallbackFn: () => "Generated fallback text response",
  });
  assert.ok(typeof fallbackTextResult === "string" && fallbackTextResult.length > 0);
  console.log("  ✔ Core Gemini Client resilient fallback & schema validation verified.");

  // 3. Profile Analyzer
  const currentYear = new Date().getFullYear();
  const profileAnalysis = await analyzeProfileWithGemini({
    targetRole: "Frontend Developer",
    education: [
      {
        id: "edu-1",
        institution: "Tech University",
        degree: "B.Tech Computer Science",
        location: "CA",
        startYear: "2023",
        endYear: String(currentYear + 2),
      },
    ],
    experience: [],
    projects: [
      {
        id: "p1",
        name: "DevHub",
        description: "Dev collaboration portal",
        technologies: ["React", "TypeScript", "Node.js"],
        highlights: ["Built responsive frontend"],
      },
    ],
    skills: {
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["React"],
    },
  });
  assert.strictEqual(profileAnalysis.careerStage, "Student");
  assert.ok(profileAnalysis.recommendedResumeStructure.includes("Student"));
  assert.ok(profileAnalysis.technicalStrengths.length > 0);
  console.log("  ✔ Gemini Profile Analyzer verified (Student stage career classification).");

  // 4. Content Optimizer (Summary, Bullets, Rewrite)
  const summaries = await generateProfessionalSummaryWithGemini({
    careerStage: "Mid-Level",
    targetRole: "Full Stack Engineer",
    verifiedSkills: ["Go", "React", "Docker", "Kubernetes"],
    recentExperience: "3 years building scalable cloud web applications",
  });
  assert.ok(summaries.summary.includes("Full Stack Engineer"));
  assert.ok(summaries.keyStrengths.length > 0);

  const improvedBullets = await improveExperienceBulletsWithGemini({
    role: "Software Developer",
    company: "Acme Corp",
    rawHighlights: ["Built payment gateway integration", "Fixed database slow queries"],
    targetRole: "Senior Backend Developer",
    technologies: ["Node.js", "PostgreSQL", "Redis"],
  });
  assert.ok(Array.isArray(improvedBullets.bullets));
  assert.ok(improvedBullets.bullets.length >= 2);
  assert.ok(improvedBullets.bullets[0].length > 15);

  const rewrittenContent = await rewriteContentWithGemini({
    text: "I did work on website performance and helped make it faster.",
    action: "make_professional",
    targetRole: "Frontend Engineer",
  });
  assert.ok(rewrittenContent.suggestedText.length > 10);
  assert.ok(rewrittenContent.explanation.length > 5);
  console.log("  ✔ Gemini Content Optimizer (summaries, bullets, rewrite) verified.");

  // 5. Project Analyzer & Batch Processing
  const singleProject = await analyzeProjectWithGemini({
    name: "cloud-metrics-pipeline",
    description: "Real-time streaming pipeline processing 10k events/sec",
    language: "Go",
    topics: ["kafka", "grpc", "prometheus"],
    stars: 35,
    forks: 8,
  });
  assert.ok(singleProject.name.toLowerCase().includes("cloud metrics"));
  assert.ok(singleProject.bullets.length >= 2);
  assert.ok(singleProject.technologies.length > 0);

  const batchProjects = await batchAnalyzeProjectsWithGemini(
    [
      {
        name: "repo-alpha",
        description: "Alpha project",
        technologies: ["TypeScript"],
        stars: 12,
        forks: 2,
        score: 50,
        githubUrl: "https://github.com/user/repo-alpha",
        updatedAt: "2024-01-01",
        highlights: [],
      },
      {
        name: "repo-beta",
        description: "Beta project",
        technologies: ["Python", "FastAPI"],
        stars: 80,
        forks: 15,
        score: 95,
        githubUrl: "https://github.com/user/repo-beta",
        updatedAt: "2024-02-01",
        highlights: [],
      },
    ],
    "Backend Engineer"
  );
  assert.strictEqual(batchProjects.length, 2);
  console.log("  ✔ Gemini Project Analyzer & Batch Repository Ranker verified.");

  // 6. Skills Taxonomy & Deduplication
  const rawSkills = ["React.js", "react", "REACT", "Node", "node.js", "Docker", "docker", "PostgreSQL", "postgres", "Git"];
  const categorizedSkills = await categorizeAndDeduplicateSkillsWithGemini({ skills: rawSkills });
  assert.ok(categorizedSkills.languages.includes("JavaScript") || categorizedSkills.frameworks.includes("React"));
  // Ensure deduplication
  const reactMatches = categorizedSkills.frameworks.filter((s) => s.toLowerCase() === "react");
  assert.strictEqual(reactMatches.length, 1, "Skills analyzer must deduplicate aliases (e.g. React.js, react, REACT)");
  console.log("  ✔ Gemini Skills Taxonomy (9-category deduplication) verified.");

  // 7. Job Analyzer & Keyword Match
  const jobAnalysis = await analyzeJobWithGemini({
    targetRole: "Senior TypeScript Engineer",
    companyName: "CloudScale Inc",
    jobDescription: "We are seeking a Senior TypeScript Engineer proficient in Next.js, GraphQL, PostgreSQL, and AWS ECS. You will design scalable microservices and lead architectural decisions.",
    candidateSkills: ["TypeScript", "Next.js", "PostgreSQL", "React", "Tailwind CSS"],
  });
  assert.ok(jobAnalysis.requiredSkills.includes("TypeScript") || jobAnalysis.requiredSkills.includes("PostgreSQL"));
  assert.ok(jobAnalysis.matchedSkills.length > 0);
  assert.ok(jobAnalysis.overallMatchScore >= 0 && jobAnalysis.overallMatchScore <= 100);
  assert.ok(jobAnalysis.recommendations.length > 0);
  console.log("  ✔ Gemini Job Analyzer (Role matching & ATS keyword alignment) verified.");

  // 8. ATS Compatibility Analyzer
  const sampleResumeData: ResumeData = {
    id: "sample-resume-id",
    title: "Jane Doe Resume",
    targetJob: { targetRole: "Backend Engineer", experienceLevel: "3-5 years", jobDescription: "" },
    certifications: [],
    achievements: [],
    activities: [],
    style: {
      templateId: "ats-professional",
      font: "inter",
      fontSize: "base",
      accentColor: "#0f172a",
      spacing: "normal",
      margins: "normal",
      sectionOrder: ["summary", "experience", "education", "skills"],
      showPhoto: false,
    },
    personal: {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+1-555-0192",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/janedoe",
      github: "https://github.com/janedoe",
      headline: "Senior Backend Engineer",
    },
    summary: "Senior Backend Engineer with 5+ years experience building distributed architectures.",
    education: [
      {
        id: "edu-1",
        institution: "UC Berkeley",
        degree: "B.S. in Computer Science",
        location: "Berkeley, CA",
        startYear: "2018",
        endYear: "2022",
      },
    ],
    experience: [
      {
        id: "exp-1",
        company: "TechFlow Systems",
        role: "Software Engineer",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        description: "Core backend engineering",
        startDate: "2022",
        endDate: "Present",
        isCurrent: true,
        highlights: [
          "Architected real-time event streaming pipeline using Kafka and Go, reducing latency by 35%.",
          "Collaborated with cross-functional teams to deploy secure authentication microservices using OAuth2.",
        ],
      },
    ],
    skills: {
      languages: ["Go", "TypeScript", "Python"],
      frameworks: ["React", "Next.js", "Express"],
      tools: ["Git", "Docker", "Kubernetes"],
      databases: ["PostgreSQL", "Redis"],
      cloud: ["AWS"],
      aiml: [],
      softSkills: [],
      other: [],
    },
    projects: [
      {
        id: "proj-1",
        name: "Distributed Cache Engine",
        overview: "In-memory LRU cache with cluster gossip protocol",
        description: "In-memory LRU cache with cluster gossip protocol",
        highlights: ["Achieved 99.9% uptime under simulated network partition"],
        technologies: ["Go", "Raft"],
      },
    ],
  };

  const atsAudit = await analyzeResumeATSWithGemini({
    resume: sampleResumeData,
    targetRole: "Backend Engineer",
  });
  assert.ok(atsAudit.overallScore >= 70, `Expected high ATS score for complete resume, got ${atsAudit.overallScore}`);
  assert.ok(atsAudit.structure >= 80, `Expected strong structure score, got ${atsAudit.structure}`);
  assert.ok(atsAudit.strengths.length > 0);
  console.log(`  ✔ Gemini ATS Analyzer verified (Audit Score: ${atsAudit.overallScore}/100, Structure: ${atsAudit.structure}/100).`);

  // 9. Template Recommender
  const templateRec = await recommendTemplateWithGemini({
    careerStage: "Senior",
    targetRole: "Engineering Director",
    experienceCount: 5,
    projectCount: 2,
  });
  assert.ok(
    ["ats-professional", "modern-minimal", "tech-pro", "student", "executive", "creative"].includes(templateRec.recommendedTemplateId),
    "Recommended template must be one of the 6 valid layouts"
  );
  assert.ok(templateRec.reason.length > 10);
  console.log(`  ✔ Gemini Template Recommender verified (Selected '${templateRec.recommendedTemplateId}').`);

  // 10. AI Resume Coach
  const coachFeedback = await executeCoachActionWithGemini({
    action: "improve_summary",
    selectedText: "I am a web developer who likes coding in JavaScript and building apps.",
    targetRole: "Frontend Tech Lead",
    sectionName: "Summary",
  });
  assert.ok(coachFeedback.suggestedText.length > 10);
  assert.ok(coachFeedback.explanation.length > 5);
  console.log("  ✔ Gemini AI Resume Coach verified (Interactive suggestion generation).");

  // 11. Document Analyzer (PDF Profile Ingestion)
  const samplePdfText = `
Jane Developer
Senior Software Engineer
San Francisco, CA
jane.dev@example.org

Contact
jane.dev@example.org (Personal)
linkedin.com/in/janedev (LinkedIn)

Summary
Accomplished software engineer with 5+ years experience building cloud applications.

Experience
Apex Cloud Systems
Senior Software Engineer
January 2021 - Present
San Francisco, CA
Spearheaded cloud infrastructure modernization migrating 40+ services to AWS ECS.
Reduced deployment cycle from 2 hours to 8 minutes through automated CI/CD pipelines.

Education
Stanford University
Bachelor of Science - BS, Computer Science
2017 - 2021

Top Skills
TypeScript
Go
AWS
Docker
Kubernetes
  `.trim();

  const extractedDoc = await extractProfileFromDocumentWithGemini({
    documentText: samplePdfText,
  });
  assert.strictEqual(extractedDoc.personal.fullName, "Jane Developer");
  assert.strictEqual(extractedDoc.personal.email, "jane.dev@example.org");
  assert.ok(extractedDoc.experiences.length >= 1);
  assert.strictEqual(extractedDoc.experiences[0].company, "Apex Cloud Systems");
  assert.ok(extractedDoc.education.length >= 1);
  assert.strictEqual(extractedDoc.education[0].institution, "Stanford University");
  assert.ok(extractedDoc.skills.length >= 2);
  console.log("  ✔ Gemini Document Analyzer verified (Clean resume/PDF text extraction).");

  // 12. End-to-End Gemini Resume Generator Orchestration
  const generatedOutput = await generateResumeWithGemini({
    targetRole: "Staff Platform Engineer",
    github: {
      success: true,
      username: "janedev",
      profile: {
        login: "janedev",
        name: "Jane Developer",
        bio: "Cloud & Distributed Systems Specialist",
        company: "Apex Cloud Systems",
        location: "San Francisco, CA",
        email: "jane.dev@example.org",
        blog: "",
        avatarUrl: "",
        htmlUrl: "https://github.com/janedev",
        createdAt: "2020-01-01",
        publicRepos: 18,
        followers: 120,
      },
      topRepositories: [
        {
          name: "infra-mesh",
          description: "Declarative service mesh controller for Kubernetes",
          githubUrl: "https://github.com/janedev/infra-mesh",
          primaryLanguage: "Go",
          technologies: ["Go", "Kubernetes", "gRPC"],
          stars: 140,
          forks: 22,
          score: 95,
          updatedAt: "2024-03-01",
          highlights: ["Engineered low-latency proxy sidecar handling 20,000 req/sec"],
        },
      ],
      allDetectedLanguages: ["Go", "Python", "TypeScript"],
      allDetectedTopics: ["kubernetes", "mesh", "cloud"],
    },
    linkedin: {
      fullName: "Jane Developer",
      headline: "Senior Cloud Engineer",
      email: "jane.dev@example.org",
      location: "San Francisco, CA",
      linkedinUrl: "https://linkedin.com/in/janedev",
      summary: "Senior Cloud Engineer",
      experiences: [
        {
          company: "Apex Cloud Systems",
          role: "Senior Cloud Engineer",
          location: "San Francisco, CA",
          startDate: "2021",
          endDate: "Present",
          isCurrent: true,
          isInternship: false,
          description: "Leading cloud architecture and container orchestration.",
          highlights: ["Managed multi-region AWS deployment"],
        },
      ],
      education: [
        {
          institution: "Stanford University",
          degree: "B.S. in Computer Science",
          startYear: "2017",
          endYear: "2021",
        },
      ],
      skills: ["Go", "AWS", "Kubernetes", "Docker"],
      certifications: [],
      honors: [],
      volunteer: [],
      publications: [],
    },
  });

  const generatedResume = generatedOutput.resume;
  assert.strictEqual(generatedResume.personal.fullName, "Jane Developer");
  assert.ok(generatedResume.experience.length >= 1);
  assert.strictEqual(generatedResume.experience[0].company, "Apex Cloud Systems");
  assert.ok(generatedResume.projects.length >= 1);
  assert.ok(generatedResume.projects[0].name.toLowerCase().includes("infra"));
  assert.ok(generatedResume.skills.languages.includes("Go"));
  assert.ok(["ats-professional", "modern-minimal", "tech-pro", "student", "executive", "creative-pro"].includes(generatedResume.style.templateId));
  console.log(`  ✔ End-to-End Gemini Resume Generator verified (Template: ${generatedResume.style.templateId}, Skills: ${generatedResume.skills.languages.length} languages).`);

  console.log("🎉 ALL DEDICATED GOOGLE GEMINI ARCHITECTURE TESTS PASSED!\n");
}
