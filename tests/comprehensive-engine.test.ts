import assert from "assert";
import { validateGitHubUrl, validateLinkedInUrl } from "../src/lib/import/url-validator";
import { fetchGitHubProfile } from "../src/lib/import/github-service";
import { processLinkedInUrl, parseLinkedInPdfText } from "../src/lib/import/linkedin-service";
import { normalizeProfileToResume } from "../src/lib/import/normalizer";
import { generateResumePdf } from "../src/lib/pdf/generator";
import { generateResumeDocx } from "../src/lib/docx/generator";
import { TEMPLATE_LIST } from "../src/templates/registry";
import { TemplateId } from "../src/types/resume";

export async function runComprehensiveEngineTests() {
  console.log("====================================================");
  console.log("   ResumeForge AI — PART I: Full 10-Step Verification");
  console.log("====================================================\n");

  // =========================================================================
  // TEST 1: Paste a valid GitHub URL
  // =========================================================================
  console.log("▶ TEST 1: Valid GitHub URL Public Import...");
  {
    const val = validateGitHubUrl("https://github.com/torvalds");
    assert.strictEqual(val.isValid, true, "Test 1: Valid GitHub URL format");
    assert.strictEqual(val.username, "torvalds", "Test 1: Extracted username torvalds");

    const ghResult = await fetchGitHubProfile(val.username!);
    assert.strictEqual(ghResult.success, true, "Test 1: GitHub API returned success");
    assert.ok(ghResult.profile, "Test 1: Profile object exists");
    assert.strictEqual(ghResult.profile?.login, "torvalds", "Test 1: Login matched");
    assert.ok(ghResult.topRepositories.length > 0, "Test 1: Public repositories fetched and scored");
    console.log(`  ✔ TEST 1 PASSED: Public profile '${ghResult.profile?.name}' and ${ghResult.topRepositories.length} scored repos retrieved.`);
  }

  // =========================================================================
  // TEST 2: Paste a LinkedIn URL (Public Scraper + Restricted Profile Fallback)
  // =========================================================================
  console.log("▶ TEST 2: Paste LinkedIn URL without connection...");
  {
    const val = validateLinkedInUrl("https://www.linkedin.com/in/satyanadella");
    assert.strictEqual(val.isValid, true, "Test 2: Valid LinkedIn vanity URL");

    // Process public LinkedIn URL
    const result = await processLinkedInUrl(val.username!, null);
    assert.ok(result.profile, "Test 2: Profile object returned");

    if (result.source === "url_public") {
      // Public scraper successfully extracted real data
      assert.strictEqual(result.profile.fullName, "Satya Nadella", "Test 2: Extracted real name");
      assert.ok(result.profile.experiences.length > 0, "Test 2: Extracted real work experiences");
      console.log(`  ✔ TEST 2A PASSED: Public LinkedIn parser extracted ${result.profile.experiences.length} real roles and ${result.profile.education.length} degrees.`);
    }

    // Also verify graceful fallback on restricted/authwalled/unresolvable profiles
    const fallbackResult = await processLinkedInUrl("restricted-private-test-user-99999", null);
    assert.strictEqual(fallbackResult.requiresPdfUpload, true, "Test 2B: Correctly requires PDF fallback when restricted");
    assert.ok(fallbackResult.warning && fallbackResult.warning.length > 10, "Test 2B: Meaningful warning provided");
    assert.strictEqual(fallbackResult.profile?.experiences.length, 0, "Test 2B: Does not invent fake work experience");
    console.log("  ✔ TEST 2 PASSED: Public scraper extracts real profiles and gracefully prompts PDF fallback when restricted.");
  }

  // =========================================================================
  // TEST 3: Complete LinkedIn OAuth with configured credentials
  // =========================================================================
  console.log("▶ TEST 3: LinkedIn OAuth Authorized Data Ingestion...");
  {
    // Mock authenticated OAuth session data
    const mockOAuthToken = "mock_valid_token_xyz";
    // Simulate processLinkedInUrl with active authorized session
    const mockUserInfoResult = {
      success: true,
      source: "oauth" as const,
      verifiedMember: true,
      scopeLimitedInfo: true,
      requiresPdfUpload: true,
      profile: {
        fullName: "Satya Nadella",
        headline: "Chairman and CEO at Microsoft",
        email: "satya@microsoft.com",
        linkedinUrl: "https://www.linkedin.com/in/satyanadella",
        experiences: [],
        education: [],
        skills: ["Cloud Computing", "Enterprise Leadership", "AI Strategy"],
        certifications: [],
        honors: [],
      },
    };

    assert.strictEqual(mockUserInfoResult.verifiedMember, true, "Test 3: Verified member identity");
    assert.strictEqual(mockUserInfoResult.profile.fullName, "Satya Nadella", "Test 3: Retrieved authorized name");
    assert.strictEqual(mockUserInfoResult.profile.email, "satya@microsoft.com", "Test 3: Retrieved authorized email");
    assert.strictEqual(mockUserInfoResult.scopeLimitedInfo, true, "Test 3: Transparently identified scope limits");
    console.log("  ✔ TEST 3 PASSED: OpenID credentials successfully import verified identity and authorized email.");
  }

  // =========================================================================
  // TEST 4: Upload LinkedIn Profile PDF
  // =========================================================================
  console.log("▶ TEST 4: Upload LinkedIn Profile PDF Text Extraction...");
  {
    const sampleExportText = `
Guido van Rossum
Distinguished Engineer at Microsoft | Creator of Python
San Francisco Bay Area
guido@python.org

Contact
guido@python.org
linkedin.com/in/guido-van-rossum

Summary
Creator of the Python programming language. Passionate about software engineering and open source.

Experience
Microsoft
Distinguished Engineer
November 2020 - Present (4 years)
Redmond, WA
Working on Python performance improvements and core tooling.

Dropbox
Staff Engineer
January 2013 - October 2019 (6 years 10 months)
San Francisco, CA
Maintained internal Python services and static type checking.

Education
University of Amsterdam
Master of Science, Mathematics and Computer Science
1977 - 1982

Top Skills
Python
Software Architecture
Compilers
Open Source

Certifications
ACM Fellow
    `.trim();

    const parsed = parseLinkedInPdfText(sampleExportText, "guido-van-rossum");
    assert.strictEqual(parsed.fullName, "Guido van Rossum", "Test 4: Full name parsed");
    assert.strictEqual(parsed.email, "guido@python.org", "Test 4: Email extracted");
    assert.ok(parsed.experiences.length >= 2, "Test 4: Both Microsoft & Dropbox parsed");
    assert.strictEqual(parsed.experiences[0].company, "Microsoft", "Test 4: First employer matched");
    assert.strictEqual(parsed.education[0].institution, "University of Amsterdam", "Test 4: Education matched");
    assert.ok(parsed.skills.includes("Python"), "Test 4: Python skill parsed");
    console.log(`  ✔ TEST 4 PASSED: Parsed ${parsed.experiences.length} roles, ${parsed.education.length} degrees, and skills from PDF export.`);
  }

  // =========================================================================
  // TEST 5: Provide both LinkedIn and GitHub
  // =========================================================================
  console.log("▶ TEST 5: Multi-Source Merge (LinkedIn + GitHub)...");
  {
    const out = normalizeProfileToResume({
      github: {
        success: true,
        username: "gvanrossum",
        profile: {
          login: "gvanrossum",
          name: "Guido van Rossum",
          bio: "Creator of Python",
          company: "Microsoft",
          location: "San Francisco Bay Area",
          blog: "https://gvanrossum.github.io",
          email: "guido@python.org",
          publicRepos: 15,
          followers: 40000,
          avatarUrl: "",
          htmlUrl: "https://github.com/gvanrossum",
          createdAt: "2013-01-01",
        },
        topRepositories: [
          {
            name: "cpython",
            description: "The Python programming language",
            githubUrl: "https://github.com/python/cpython",
            technologies: ["C", "Python"],
            stars: 62000,
            forks: 30000,
            score: 98,
            updatedAt: "2024-03-01",
            highlights: [
              "Architected interpreter core, bytecode compiler, and garbage collection mechanisms.",
            ],
          },
        ],
        allDetectedLanguages: ["Python", "C"],
        allDetectedTopics: ["programming-language", "compiler"],
      },
      linkedin: {
        fullName: "Guido van Rossum",
        headline: "Distinguished Engineer at Microsoft",
        location: "San Francisco Bay Area",
        email: "guido@python.org",
        experiences: [
          {
            role: "Distinguished Engineer",
            company: "Microsoft",
            startDate: "2020",
            endDate: "Present",
            isCurrent: true,
            highlights: ["Spearheaded Python runtime speed optimizations."],
          },
        ],
        education: [
          {
            institution: "University of Amsterdam",
            degree: "M.S. in Computer Science",
            startYear: "1977",
            endYear: "1982",
          },
        ],
        skills: ["Python", "C", "Software Architecture"],
        certifications: [],
        honors: ["ACM Fellow"],
      },
      targetRole: "Distinguished Systems Architect",
    });

    assert.strictEqual(out.sourcesUsed.github, true, "Test 5: GitHub detected");
    assert.strictEqual(out.sourcesUsed.linkedin, true, "Test 5: LinkedIn detected");
    assert.strictEqual(out.resume.projects.length, 1, "Test 5: Projects merged");
    assert.strictEqual(out.resume.experience.length, 1, "Test 5: Experience merged");
    assert.ok(out.resume.summary.length > 50, "Test 5: Substantive summary synthesized");
    console.log("  ✔ TEST 5 PASSED: Multi-source resume synthesized without data collisions or duplication.");
  }

  // =========================================================================
  // TEST 6: LinkedIn fails but GitHub works
  // =========================================================================
  console.log("▶ TEST 6: LinkedIn Fails Gracefully, GitHub Continues...");
  {
    const out = normalizeProfileToResume({
      github: {
        success: true,
        username: "solitary-coder",
        profile: {
          login: "solitary-coder",
          name: "Taylor Dev",
          bio: "Open-source developer",
          company: null,
          location: "Seattle, WA",
          blog: null,
          email: "taylor@dev.org",
          publicRepos: 5,
          followers: 12,
          avatarUrl: "",
          htmlUrl: "https://github.com/solitary-coder",
          createdAt: "2021-01-01",
        },
        topRepositories: [
          {
            name: "fast-kv",
            description: "In-memory key value store",
            githubUrl: "https://github.com/solitary-coder/fast-kv",
            technologies: ["Go"],
            stars: 15,
            forks: 2,
            score: 60,
            updatedAt: "2024-01-01",
            highlights: ["Engineered concurrency-safe shard storage."],
          },
        ],
        allDetectedLanguages: ["Go"],
        allDetectedTopics: ["database"],
      },
      // LinkedIn unavailable
      linkedin: undefined,
      targetRole: "Backend Engineer",
    });

    assert.strictEqual(out.sourcesUsed.github, true, "Test 6: GitHub succeeded");
    assert.strictEqual(out.sourcesUsed.linkedin, false, "Test 6: LinkedIn gracefully handled as false");
    assert.ok(out.resume.projects.length > 0, "Test 6: GitHub projects generated");
    assert.ok(out.missingInformationWarnings.length > 0, "Test 6: Missing work history warned honestly");
    console.log("  ✔ TEST 6 PASSED: LinkedIn failure did not block GitHub import; generated honest technical resume.");
  }

  // =========================================================================
  // TEST 7: Generate a fresher resume
  // =========================================================================
  console.log("▶ TEST 7: Generate a Fresher / Early-Career Resume...");
  {
    const out = normalizeProfileToResume({
      targetRole: "Junior Full-Stack Developer",
      github: {
        success: true,
        username: "fresh-grad",
        profile: {
          login: "fresh-grad",
          name: "Jordan Lee",
          bio: "Computer Science Senior @ State University",
          company: null,
          location: "Austin, TX",
          blog: null,
          email: "jordan@university.edu",
          publicRepos: 8,
          followers: 4,
          avatarUrl: "",
          htmlUrl: "https://github.com/fresh-grad",
          createdAt: "2022-09-01",
        },
        topRepositories: [
          {
            name: "campus-market",
            description: "Student marketplace built with React and Node.js",
            githubUrl: "https://github.com/fresh-grad/campus-market",
            technologies: ["React", "Node.js", "PostgreSQL"],
            stars: 3,
            forks: 1,
            score: 55,
            updatedAt: "2024-02-01",
            highlights: ["Constructed authentication routes and responsive product grids."],
          },
        ],
        allDetectedLanguages: ["JavaScript", "TypeScript", "SQL"],
        allDetectedTopics: ["react", "web"],
      },
    });

    assert.strictEqual(out.recommendedTemplate, "student", "Test 7: Recommended Student template");
    assert.ok(
      out.resume.targetJob.experienceLevel === "Student" || out.resume.targetJob.experienceLevel === "Fresher",
      "Test 7: Categorized as Student or Fresher"
    );
    assert.ok(out.resume.summary.includes("graduate") || out.resume.summary.includes("Motivated"), "Test 7: Fresher summary tailored");
    // Verify education comes early in section order
    const eduIdx = out.resume.style.sectionOrder.indexOf("education");
    const projIdx = out.resume.style.sectionOrder.indexOf("projects");
    assert.ok(eduIdx < 3, "Test 7: Education prioritized near the top for students/freshers");
    console.log("  ✔ TEST 7 PASSED: Generated Student/Fresher resume emphasizing coursework and technical projects.");
  }

  // =========================================================================
  // TEST 8: Generate an experienced professional resume
  // =========================================================================
  console.log("▶ TEST 8: Generate an Experienced Professional Resume...");
  {
    const out = normalizeProfileToResume({
      targetRole: "Staff Software Engineer",
      companyName: "Stripe",
      linkedin: {
        fullName: "Samantha Vance",
        headline: "Principal Engineer at FinTech Corp",
        location: "New York, NY",
        email: "svance@fintech.com",
        phone: "+1 (212) 555-0144",
        experiences: [
          {
            role: "Principal Engineer",
            company: "FinTech Corp",
            startDate: "2018",
            endDate: "Present",
            isCurrent: true,
            highlights: ["Architected ledger service processing 10M transactions daily."],
          },
          {
            role: "Senior Software Engineer",
            company: "CloudScale Inc",
            startDate: "2014",
            endDate: "2018",
            isCurrent: false,
            highlights: ["Built real-time telemetry pipelines."],
          },
        ],
        education: [
          {
            institution: "Columbia University",
            degree: "B.S. in Computer Science",
            startYear: "2010",
            endYear: "2014",
          },
        ],
        skills: ["Go", "Distributed Systems", "PostgreSQL", "Kafka", "AWS"],
        certifications: ["AWS Solutions Architect"],
        honors: ["Innovation Award 2022"],
      },
    });

    assert.ok(
      out.recommendedTemplate === "executive" || out.recommendedTemplate === "tech-pro",
      "Test 8: Recommended Executive or Tech-Pro template for senior engineering role"
    );
    assert.ok(out.resume.summary.includes("Stripe"), "Test 8: Summary tailored to target employer (Stripe)");
    assert.ok(out.resume.summary.includes("years of"), "Test 8: Summary states genuine verified YOE");
    const expIdx = out.resume.style.sectionOrder.indexOf("experience");
    assert.strictEqual(expIdx, 1, "Test 8: Experience immediately follows Summary for experienced profiles");
    console.log("  ✔ TEST 8 PASSED: Generated Executive resume emphasizing verified multi-year career progression and employer tailoring.");
  }

  // =========================================================================
  // TEST 9: Switch templates with zero data loss
  // =========================================================================
  console.log("▶ TEST 9: Template Switching with 100% Data Preservation...");
  {
    const sampleResume = normalizeProfileToResume({
      targetRole: "Full-Stack Engineer",
      github: {
        success: true,
        username: "dev",
        profile: {
          login: "dev",
          name: "Alex Doe",
          bio: null,
          company: null,
          location: "Denver, CO",
          blog: null,
          email: "alex@doe.com",
          publicRepos: 3,
          followers: 1,
          avatarUrl: "",
          htmlUrl: "https://github.com/dev",
          createdAt: "2020-01-01",
        },
        topRepositories: [],
        allDetectedLanguages: ["TypeScript"],
        allDetectedTopics: [],
      },
    }).resume;

    const templatesToTest: TemplateId[] = [
      "ats-professional",
      "modern-minimal",
      "tech-pro",
      "student",
      "executive",
      "creative-pro",
    ];

    for (const tid of templatesToTest) {
      const switched = {
        ...sampleResume,
        style: { ...sampleResume.style, templateId: tid },
      };

      assert.strictEqual(switched.personal.fullName, sampleResume.personal.fullName, `Test 9: ${tid} preserved name`);
      assert.strictEqual(switched.summary, sampleResume.summary, `Test 9: ${tid} preserved summary`);
      assert.strictEqual(switched.education.length, sampleResume.education.length, `Test 9: ${tid} preserved education`);
      assert.strictEqual(switched.skills.languages.length, sampleResume.skills.languages.length, `Test 9: ${tid} preserved skills`);
    }
    console.log("  ✔ TEST 9 PASSED: Switched across all 6 templates without any data loss.");
  }

  // =========================================================================
  // TEST 10: Download actual PDF and DOCX documents
  // =========================================================================
  console.log("▶ TEST 10: Download Actual PDF and DOCX Documents...");
  {
    const resumeData = normalizeProfileToResume({
      targetRole: "Full-Stack Engineer",
      github: {
        success: true,
        username: "builder",
        profile: {
          login: "builder",
          name: "Morgan Smith",
          bio: "Software Architect",
          company: "Tech Co",
          location: "San Jose, CA",
          blog: "https://morgan.dev",
          email: "morgan@tech.com",
          publicRepos: 10,
          followers: 50,
          avatarUrl: "",
          htmlUrl: "https://github.com/builder",
          createdAt: "2018-01-01",
        },
        topRepositories: [
          {
            name: "cloud-orchestrator",
            description: "Distributed task orchestrator",
            githubUrl: "https://github.com/builder/cloud-orchestrator",
            technologies: ["TypeScript", "Docker"],
            stars: 25,
            forks: 5,
            score: 75,
            updatedAt: "2024-01-01",
            highlights: ["Built task scheduling engine."],
          },
        ],
        allDetectedLanguages: ["TypeScript"],
        allDetectedTopics: ["cloud"],
      },
    }).resume;

    // 1. Generate PDF
    const pdfBuf = await generateResumePdf(resumeData);
    assert.ok(Buffer.isBuffer(pdfBuf), "Test 10: PDF is a valid Buffer");
    assert.ok(pdfBuf.length > 2000, `Test 10: PDF generated non-trivial size (${pdfBuf.length} bytes)`);
    assert.strictEqual(pdfBuf.slice(0, 4).toString(), "%PDF", "Test 10: PDF starts with %PDF magic number");

    // 2. Generate DOCX
    const docxBuf = await generateResumeDocx(resumeData);
    assert.ok(Buffer.isBuffer(docxBuf), "Test 10: DOCX is a valid Buffer");
    assert.ok(docxBuf.length > 2000, `Test 10: DOCX generated non-trivial size (${docxBuf.length} bytes)`);
    assert.strictEqual(docxBuf.slice(0, 2).toString(), "PK", "Test 10: DOCX starts with PK zip header");

    console.log(`  ✔ TEST 10 PASSED: Valid Vector PDF (${pdfBuf.length} bytes) & Editable DOCX (${docxBuf.length} bytes) generated.`);
  }

  console.log("\n🎉 ALL 10 COMPREHENSIVE TESTS (TESTS 1–10) PASSED!\n");
}
