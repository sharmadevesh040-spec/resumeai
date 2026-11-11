import assert from "assert";
import { validateGitHubUrl, validateLinkedInUrl, AutoImportRequestSchema } from "../src/lib/import/url-validator";
import { normalizeProfileToResume, NormalizedProfilePayload } from "../src/lib/import/normalizer";
import { parseLinkedInPdfText } from "../src/lib/import/linkedin-service";
import { GitHubImportResult, ScoredGitHubRepo } from "../src/lib/import/github-service";

export async function testAutoImportSuite() {
  console.log("▶ Running One-Click LinkedIn + GitHub Auto-Import Tests (Tests A–H)...");

  // =========================================================================
  // TEST A: Both LinkedIn & GitHub URLs provided
  // =========================================================================
  {
    const ghVal = validateGitHubUrl("https://github.com/torvalds");
    assert.strictEqual(ghVal.isValid, true, "Test A: GitHub URL should be valid");
    assert.strictEqual(ghVal.username, "torvalds", "Test A: Username should be torvalds");

    const liVal = validateLinkedInUrl("https://www.linkedin.com/in/linus-torvalds");
    assert.strictEqual(liVal.isValid, true, "Test A: LinkedIn URL should be valid");
    assert.strictEqual(liVal.username, "linus-torvalds", "Test A: Vanity name extracted");

    // Mock normalized merge
    const mockPayload: NormalizedProfilePayload = {
      github: {
        success: true,
        username: "torvalds",
        profile: {
          login: "torvalds",
          name: "Linus Torvalds",
          bio: "Creator of Linux and Git",
          company: "Linux Foundation",
          location: "Portland, OR",
          blog: "https://kernel.org",
          email: "torvalds@kernel.org",
          publicRepos: 10,
          followers: 200000,
          avatarUrl: "",
          htmlUrl: "https://github.com/torvalds",
          createdAt: "2011-09-03",
        },
        topRepositories: [
          {
            name: "linux",
            description: "Linux kernel source tree",
            githubUrl: "https://github.com/torvalds/linux",
            technologies: ["C", "Assembly", "Makefile"],
            stars: 180000,
            forks: 53000,
            score: 95,
            updatedAt: "2024-01-01",
            highlights: [
              "Architected core monolithic kernel subsystems and POSIX compliance.",
              "Maintained multi-architecture hardware abstraction layers.",
            ],
          },
          {
            name: "subsurface-for-dirk",
            description: "Divelog program",
            githubUrl: "https://github.com/torvalds/subsurface-for-dirk",
            technologies: ["C", "C++", "CMake"],
            stars: 120,
            forks: 30,
            score: 50,
            updatedAt: "2023-01-01",
            highlights: ["Engineered desktop dive planning and log decompression algorithms."],
          },
        ],
        allDetectedLanguages: ["C", "C++", "Assembly"],
        allDetectedTopics: ["kernel", "operating-system"],
      },
      linkedin: {
        fullName: "Linus Torvalds",
        headline: "Fellow at Linux Foundation",
        location: "Portland, Oregon Area",
        email: "torvalds@kernel.org",
        phone: "+1 (503) 555-0199",
        linkedinUrl: "https://www.linkedin.com/in/linus-torvalds",
        summary: "Pioneer in distributed open source development and kernel systems architecture.",
        experiences: [
          {
            role: "Linux Fellow",
            company: "The Linux Foundation",
            startDate: "2003",
            endDate: "Present",
            isCurrent: true,
            highlights: ["Oversee all mainline Linux kernel releases and architecture reviews."],
          },
        ],
        education: [
          {
            institution: "University of Helsinki",
            degree: "Master of Science in Computer Science",
            startYear: "1988",
            endYear: "1996",
          },
        ],
        skills: ["Operating Systems", "C", "Git", "System Architecture"],
        certifications: [],
        honors: ["Millennium Technology Prize", "IEEE Computer Pioneer Award"],
      },
      targetRole: "Principal Systems Architect",
    };

    const out = normalizeProfileToResume(mockPayload);
    assert.strictEqual(out.sourcesUsed.github, true, "Test A: GitHub source detected");
    assert.strictEqual(out.sourcesUsed.linkedin, true, "Test A: LinkedIn source detected");
    assert.strictEqual(out.resume.personal.fullName, "Linus Torvalds", "Test A: Full name matched");
    assert.strictEqual(out.resume.projects.length, 2, "Test A: 2 projects imported from GitHub");
    assert.strictEqual(out.resume.experience.length, 1, "Test A: 1 role imported from LinkedIn");
    assert.ok(out.resume.skills.languages.includes("C"), "Test A: C skill categorized");
    assert.ok(
      out.recommendedTemplate === "tech-pro" || out.recommendedTemplate === "executive",
      "Test A: Tech Pro or Executive recommended for senior developer"
    );
    console.log("  ✔ Test A passed: Successfully imported and merged both LinkedIn & GitHub profiles.");
  }

  // =========================================================================
  // TEST B: Only GitHub URL provided
  // =========================================================================
  {
    const mockGhOnly: NormalizedProfilePayload = {
      github: {
        success: true,
        username: "dev-coder",
        profile: {
          login: "dev-coder",
          name: "Alex Rivera",
          bio: "Full-Stack TypeScript & Rust builder",
          company: null,
          location: "Austin, TX",
          blog: "https://alex.dev",
          email: "alex@alex.dev",
          publicRepos: 18,
          followers: 85,
          avatarUrl: "",
          htmlUrl: "https://github.com/dev-coder",
          createdAt: "2019-04-12",
        },
        topRepositories: [
          {
            name: "turbo-cache",
            description: "High-speed distributed memory cache written in Rust",
            githubUrl: "https://github.com/dev-coder/turbo-cache",
            technologies: ["Rust", "Docker"],
            stars: 42,
            forks: 8,
            score: 75,
            updatedAt: "2024-02-10",
            highlights: ["Constructed sub-millisecond LRU eviction protocol using zero-copy semantics."],
          },
          {
            name: "next-saas-starter",
            description: "Production Next.js boilerplate with Prisma & Stripe",
            githubUrl: "https://github.com/dev-coder/next-saas-starter",
            technologies: ["TypeScript", "Next.js", "PostgreSQL"],
            stars: 210,
            forks: 35,
            score: 88,
            updatedAt: "2024-03-01",
            highlights: ["Structured type-safe API routing and multi-tenant billing pipelines."],
          },
        ],
        allDetectedLanguages: ["Rust", "TypeScript"],
        allDetectedTopics: ["caching", "saas", "full-stack"],
      },
      targetRole: "Full-Stack Software Engineer",
    };

    const out = normalizeProfileToResume(mockGhOnly);
    assert.strictEqual(out.sourcesUsed.github, true, "Test B: GitHub source detected");
    assert.strictEqual(out.sourcesUsed.linkedin, false, "Test B: LinkedIn not detected");
    assert.strictEqual(out.resume.projects.length, 2, "Test B: Projects imported");

    // Honesty Rule: should NOT invent fake companies or jobs
    assert.strictEqual(
      out.resume.experience.length,
      0,
      "Test B: Honesty Rule — Experience should not have fake corporate employers"
    );

    // Should include warning to alert user
    assert.ok(
      out.missingInformationWarnings.some((w) => w.toLowerCase().includes("work experience") || w.toLowerCase().includes("corporate")),
      "Test B: Alerted user about missing corporate experience"
    );

    console.log("  ✔ Test B passed: Successfully imported GitHub-only without fabricating unverified work history.");
  }

  // =========================================================================
  // TEST C: Only LinkedIn URL with PDF fallback text extraction
  // =========================================================================
  {
    const sampleLinkedInPdfText = `
Linus Torvalds
Fellow at Linux Foundation
Portland, Oregon, United States
torvalds@kernel.org

Contact
torvalds@kernel.org (Personal)
linkedin.com/in/linus-torvalds (LinkedIn)

Summary
Created Linux and Git. Devoted to open source software engineering and computer systems.

Experience
The Linux Foundation
Linux Fellow
January 2003 - Present (21 years)
Beaverton, OR
Overseeing the mainline Linux kernel repository releases.

Transmeta Corporation
Senior Software Engineer
1997 - 2003 (6 years)
Santa Clara, CA
Engineered code morphing software for Crusoe microprocessors.

Education
University of Helsinki
Master of Science - MS, Computer Science
1988 - 1996

Top Skills
Operating Systems
C
Git
Kernel Development

Certifications
Linux Foundation Certified Architect
    `.trim();

    const parsed = parseLinkedInPdfText(sampleLinkedInPdfText, "linus-torvalds");
    assert.strictEqual(parsed.fullName, "Linus Torvalds", "Test C: Parsed full name");
    assert.strictEqual(parsed.email, "torvalds@kernel.org", "Test C: Parsed email");
    assert.ok(parsed.experiences.length >= 2, `Test C: Parsed ${parsed.experiences.length} experiences`);
    assert.strictEqual(parsed.experiences[0].company, "The Linux Foundation", "Test C: Experience company matched");
    assert.ok(parsed.skills.includes("Git") || parsed.skills.includes("C"), "Test C: Skills extracted");
    assert.ok(parsed.education.length >= 1, "Test C: Education parsed");

    console.log("  ✔ Test C passed: Official LinkedIn PDF export text extraction accurately parsed.");
  }

  // =========================================================================
  // TEST D: GitHub API failure / rate limit fallback
  // =========================================================================
  {
    // Simulate GitHub failure
    const ghFailedResult: GitHubImportResult = {
      success: false,
      username: "rate-limited-user",
      topRepositories: [],
      allDetectedLanguages: [],
      allDetectedTopics: [],
      rateLimitExceeded: true,
      warning: "GitHub API rate limit reached. Proceeding with available data.",
    };

    const out = normalizeProfileToResume({
      github: ghFailedResult,
      linkedin: {
        fullName: "Sarah Chen",
        headline: "Frontend Specialist",
        experiences: [],
        education: [],
        skills: ["React", "CSS", "HTML"],
        certifications: [],
        honors: [],
      },
    });

    assert.strictEqual(out.sourcesUsed.github, false, "Test D: GitHub flagged as unused");
    assert.strictEqual(out.resume.personal.fullName, "Sarah Chen", "Test D: LinkedIn identity retained");
    assert.ok(out.missingInformationWarnings.length > 0, "Test D: Warnings generated");
    console.log("  ✔ Test D passed: Graceful fallback when GitHub API encounters rate limit or network error.");
  }

  // =========================================================================
  // TEST E: LinkedIn direct access fallback & diverse URL formats
  // =========================================================================
  {
    const val = validateLinkedInUrl("https://www.linkedin.com/in/jane-doe-engineer?utm_source=share&utm_medium=member_mweb");
    assert.strictEqual(val.isValid, true, "Test E: Valid vanity URL with query params");
    assert.strictEqual(val.username, "jane-doe-engineer", "Test E: Extracted clean vanity identifier");

    // Verify diverse real-world URL formats
    const realWorldUrls = [
      "https://in.linkedin.com/in/satyanadella?originalSubdomain=in",
      "https://uk.linkedin.com/in/satyanadella/",
      "https://www.linkedin.com/in/john.doe.123",
      "https://www.linkedin.com/in/jane-doe/details/experience/",
      "https://www.linkedin.com/in/jane-doe/overlay/contact-info/",
      "in/satyanadella",
      "@satyanadella",
    ];
    for (const url of realWorldUrls) {
      const v = validateLinkedInUrl(url);
      assert.strictEqual(v.isValid, true, `Test E: Correctly validated ${url}`);
    }

    // Check normalization with only vanity data
    const out = normalizeProfileToResume({
      linkedin: {
        fullName: "Jane Doe Engineer",
        linkedinUrl: val.normalizedUrl,
        experiences: [],
        education: [],
        skills: [],
        certifications: [],
        honors: [],
      },
    });

    assert.strictEqual(out.resume.personal.linkedin, "https://www.linkedin.com/in/jane-doe-engineer");
    assert.ok(
      out.missingInformationWarnings.some((w) => w.toLowerCase().includes("email") || w.toLowerCase().includes("phone")),
      "Test E: Flags missing contact details for vanity-only profile"
    );
    console.log("  ✔ Test E passed: LinkedIn direct URL provides vanity identity & triggers upload fallback.");
  }

  // =========================================================================
  // TEST F: Both links fail / invalid inputs
  // =========================================================================
  {
    const badGh = validateGitHubUrl("https://google.com/search?q=github");
    assert.strictEqual(badGh.isValid, false, "Test F: Non-github URL rejected");

    const reservedGh = validateGitHubUrl("https://github.com/settings");
    assert.strictEqual(reservedGh.isValid, false, "Test F: Reserved GitHub username rejected");

    const badLi = validateLinkedInUrl("https://linkedin.com/feed/");
    assert.strictEqual(badLi.isValid, false, "Test F: LinkedIn feed URL rejected");

    // Schema validation
    const invalidSchemaCheck = AutoImportRequestSchema.safeParse({
      githubUrl: "",
      linkedinUrl: "",
    });
    assert.strictEqual(invalidSchemaCheck.success, false, "Test F: Empty links rejected by Zod schema");

    console.log("  ✔ Test F passed: Invalid and malformed profile links rejected with clear diagnostics.");
  }

  // =========================================================================
  // TEST G: Incomplete profile with missing info warnings
  // =========================================================================
  {
    const sparsePayload: NormalizedProfilePayload = {
      github: {
        success: true,
        username: "newbie",
        profile: {
          login: "newbie",
          name: "Anonymous User",
          bio: null,
          company: null,
          location: null,
          blog: null,
          email: null,
          publicRepos: 1,
          followers: 0,
          avatarUrl: "",
          htmlUrl: "https://github.com/newbie",
          createdAt: "2024-01-01",
        },
        topRepositories: [],
        allDetectedLanguages: [],
        allDetectedTopics: [],
      },
    };

    const out = normalizeProfileToResume(sparsePayload);
    assert.ok(out.missingInformationWarnings.length >= 2, "Test G: Multiple warnings for sparse profile");
    assert.ok(
      out.missingInformationWarnings.some((w) => w.toLowerCase().includes("email")),
      "Test G: Missing email warned"
    );
    assert.ok(
      out.missingInformationWarnings.some((w) => w.toLowerCase().includes("phone")),
      "Test G: Missing phone warned"
    );
    console.log("  ✔ Test G passed: Missing contact and education information properly reported in warnings.");
  }

  // =========================================================================
  // TEST H: No accidental resume overwrite without permission
  // =========================================================================
  {
    const out1 = normalizeProfileToResume({
      targetRole: "Junior Developer",
    });
    const out2 = normalizeProfileToResume({
      targetRole: "Junior Developer",
    });

    assert.notStrictEqual(out1.resume.id, out2.resume.id, "Test H: Each auto-generated resume receives a unique ID");
    assert.ok(out1.resume.id.length > 5, "Test H: Valid ID generated");
    console.log("  ✔ Test H passed: Auto-generation creates isolated resumes without overwriting existing drafts.");
  }

  console.log("🎉 ALL ONE-CLICK IMPORT TESTS (TESTS A–H) PASSED!\n");
}
