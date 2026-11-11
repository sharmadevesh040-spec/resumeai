import { callGemini } from "./gemini";
import { SkillsTaxonomySchema } from "./gemini-schemas";
import { z } from "zod";

export type SkillsTaxonomy = z.infer<typeof SkillsTaxonomySchema>;

const SKILLS_ANALYZER_PROMPT = `
You are a Principal Software Engineer and Skills Taxonomy Architect.
Analyze the provided pool of candidate skills, repository topics, detected languages, and job context.

Classify all verified skills cleanly into these exact 9 categories:
1. languages: Programming & scripting languages (e.g. Python, TypeScript, Java, C++, Go, Rust, SQL)
2. frameworks: Application & UI frameworks (e.g. React, Next.js, Django, FastAPI, Spring Boot, Express, Vue)
3. libraries: Specialized utility libraries (e.g. Redux, Prisma, Tailwind CSS, Pandas, NumPy)
4. databases: Relational, NoSQL, Vector databases (e.g. PostgreSQL, Redis, MongoDB, MySQL, Pinecone)
5. aiml: Machine learning, LLM, data science (e.g. PyTorch, TensorFlow, LangChain, Hugging Face, Scikit-learn)
6. tools: Developer tooling, VCS, build systems (e.g. Git, Docker, Webpack, Postman, Vite)
7. cloud: Cloud providers & infrastructure (e.g. AWS, GCP, Azure, Vercel, Kubernetes, Terraform)
8. coreCs: Fundamental CS competencies (e.g. Data Structures & Algorithms, System Design, REST APIs, Microservices, CI/CD)
9. softSkills: Professional competencies (e.g. Agile Methodologies, Technical Writing, Cross-Functional Collaboration)
10. other: Any additional verified competencies

Rules:
- Deduplicate synonyms (e.g. "ReactJS" -> "React", "Node" -> "Node.js").
- Do NOT invent unverified skills.
- Prioritize skills most relevant to the target role.

Respond ONLY with valid JSON matching the SkillsTaxonomy schema.
`;

/**
 * Categorizes and deduplicates skills into a 9-category taxonomy using Gemini.
 */
export async function categorizeSkillsWithGemini(
  skillsPool: string[],
  targetRole?: string | null,
  jobDescription?: string | null
): Promise<SkillsTaxonomy> {
  const cleanPool = Array.from(new Set(skillsPool.map((s) => s.trim()).filter((s) => s.length > 1)));

  const prompt = `
Raw Skills and Topics Pool (${cleanPool.length} items):
${JSON.stringify(cleanPool)}

Target Job Role: "${targetRole || "Software Engineering"}"
${jobDescription ? `Target Job Description: ${jobDescription.slice(0, 300)}` : ""}

Classify and organize these skills according to the requested 9-category schema.
`;

  return callGemini<SkillsTaxonomy>({
    systemInstruction: SKILLS_ANALYZER_PROMPT,
    prompt,
    schema: SkillsTaxonomySchema,
    taskType: "standard",
    operationName: "skills_analyzer",
    fallbackFn: () => {
      // Deterministic classification with canonical deduplication
      const languages = new Set<string>();
      const frameworks = new Set<string>();
      const databases = new Set<string>();
      const tools = new Set<string>();
      const cloud = new Set<string>();
      const aiml = new Set<string>();
      const other = new Set<string>();

      const canonicalMap: Record<string, { cat: "lang" | "frame" | "db" | "tool" | "cloud" | "aiml"; name: string }> = {
        javascript: { cat: "lang", name: "JavaScript" },
        js: { cat: "lang", name: "JavaScript" },
        typescript: { cat: "lang", name: "TypeScript" },
        ts: { cat: "lang", name: "TypeScript" },
        python: { cat: "lang", name: "Python" },
        java: { cat: "lang", name: "Java" },
        "c++": { cat: "lang", name: "C++" },
        cpp: { cat: "lang", name: "C++" },
        "c#": { cat: "lang", name: "C#" },
        csharp: { cat: "lang", name: "C#" },
        go: { cat: "lang", name: "Go" },
        golang: { cat: "lang", name: "Go" },
        rust: { cat: "lang", name: "Rust" },
        php: { cat: "lang", name: "PHP" },
        ruby: { cat: "lang", name: "Ruby" },
        sql: { cat: "lang", name: "SQL" },
        html: { cat: "lang", name: "HTML5" },
        css: { cat: "lang", name: "CSS3" },
        kotlin: { cat: "lang", name: "Kotlin" },
        swift: { cat: "lang", name: "Swift" },
        react: { cat: "frame", name: "React" },
        "react.js": { cat: "frame", name: "React" },
        reactjs: { cat: "frame", name: "React" },
        "next.js": { cat: "frame", name: "Next.js" },
        nextjs: { cat: "frame", name: "Next.js" },
        vue: { cat: "frame", name: "Vue.js" },
        vuejs: { cat: "frame", name: "Vue.js" },
        angular: { cat: "frame", name: "Angular" },
        node: { cat: "frame", name: "Node.js" },
        "node.js": { cat: "frame", name: "Node.js" },
        nodejs: { cat: "frame", name: "Node.js" },
        express: { cat: "frame", name: "Express" },
        django: { cat: "frame", name: "Django" },
        fastapi: { cat: "frame", name: "FastAPI" },
        "spring boot": { cat: "frame", name: "Spring Boot" },
        flask: { cat: "frame", name: "Flask" },
        laravel: { cat: "frame", name: "Laravel" },
        postgresql: { cat: "db", name: "PostgreSQL" },
        postgres: { cat: "db", name: "PostgreSQL" },
        mysql: { cat: "db", name: "MySQL" },
        mongodb: { cat: "db", name: "MongoDB" },
        redis: { cat: "db", name: "Redis" },
        sqlite: { cat: "db", name: "SQLite" },
        prisma: { cat: "db", name: "Prisma" },
        git: { cat: "tool", name: "Git" },
        github: { cat: "tool", name: "GitHub" },
        docker: { cat: "tool", name: "Docker" },
        postman: { cat: "tool", name: "Postman" },
        linux: { cat: "tool", name: "Linux" },
        aws: { cat: "cloud", name: "AWS" },
        gcp: { cat: "cloud", name: "GCP" },
        azure: { cat: "cloud", name: "Azure" },
        kubernetes: { cat: "cloud", name: "Kubernetes" },
        k8s: { cat: "cloud", name: "Kubernetes" },
        vercel: { cat: "cloud", name: "Vercel" },
        tensorflow: { cat: "aiml", name: "TensorFlow" },
        pytorch: { cat: "aiml", name: "PyTorch" },
        langchain: { cat: "aiml", name: "LangChain" },
      };

      for (const item of cleanPool) {
        const lower = item.toLowerCase().trim();
        const mapped = canonicalMap[lower];
        if (mapped) {
          if (mapped.cat === "lang") languages.add(mapped.name);
          else if (mapped.cat === "frame") frameworks.add(mapped.name);
          else if (mapped.cat === "db") databases.add(mapped.name);
          else if (mapped.cat === "tool") tools.add(mapped.name);
          else if (mapped.cat === "cloud") cloud.add(mapped.name);
          else if (mapped.cat === "aiml") aiml.add(mapped.name);
        } else {
          other.add(item);
        }
      }

      return {
        languages: languages.size > 0 ? Array.from(languages) : ["TypeScript", "JavaScript", "Python"],
        frameworks: frameworks.size > 0 ? Array.from(frameworks) : ["React", "Next.js"],
        libraries: [],
        databases: databases.size > 0 ? Array.from(databases) : ["PostgreSQL"],
        tools: tools.size > 0 ? Array.from(tools) : ["Git", "Docker"],
        cloud: Array.from(cloud),
        aiml: Array.from(aiml),
        coreCs: ["Data Structures & Algorithms", "RESTful APIs", "System Architecture"],
        softSkills: ["Agile Development", "Technical Communication", "Code Review"],
        other: Array.from(other).slice(0, 5),
      };
    },
  });
}

/**
 * Convenient wrapper / alias for categorizeSkillsWithGemini.
 */
export async function categorizeAndDeduplicateSkillsWithGemini(
  input: { skills: string[]; targetRole?: string | null; jobDescription?: string | null } | string[],
  targetRole?: string | null,
  jobDescription?: string | null
): Promise<SkillsTaxonomy> {
  if (Array.isArray(input)) {
    return categorizeSkillsWithGemini(input, targetRole, jobDescription);
  }
  return categorizeSkillsWithGemini(input.skills, input.targetRole, input.jobDescription);
}
