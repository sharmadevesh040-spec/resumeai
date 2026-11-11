import { SkillCategories } from "@/types/resume";

export const SKILL_DATABASE: Record<string, keyof SkillCategories | "coreCs"> = {
  // Programming Languages
  javascript: "languages",
  typescript: "languages",
  python: "languages",
  java: "languages",
  "c++": "languages",
  cpp: "languages",
  "c#": "languages",
  csharp: "languages",
  c: "languages",
  go: "languages",
  golang: "languages",
  rust: "languages",
  ruby: "languages",
  php: "languages",
  swift: "languages",
  kotlin: "languages",
  dart: "languages",
  scala: "languages",
  r: "languages",
  shell: "languages",
  bash: "languages",
  powershell: "languages",
  sql: "languages",
  graphql: "languages",
  html: "languages",
  css: "languages",

  // Frameworks & Libraries
  react: "frameworks",
  "react.js": "frameworks",
  "react native": "frameworks",
  next: "frameworks",
  "next.js": "frameworks",
  nextjs: "frameworks",
  vue: "frameworks",
  "vue.js": "frameworks",
  angular: "frameworks",
  svelte: "frameworks",
  express: "frameworks",
  "express.js": "frameworks",
  node: "frameworks",
  "node.js": "frameworks",
  nodejs: "frameworks",
  fastapi: "frameworks",
  django: "frameworks",
  flask: "frameworks",
  spring: "frameworks",
  "spring boot": "frameworks",
  nest: "frameworks",
  "nest.js": "frameworks",
  nestjs: "frameworks",
  tailwind: "frameworks",
  "tailwind css": "frameworks",
  bootstrap: "frameworks",
  shadcn: "frameworks",
  "framer motion": "frameworks",
  redux: "frameworks",
  zustand: "frameworks",
  prisma: "frameworks",
  typeorm: "frameworks",
  hibernate: "frameworks",

  // Databases & Storage
  postgresql: "databases",
  postgres: "databases",
  mysql: "databases",
  mongodb: "databases",
  sqlite: "databases",
  redis: "databases",
  supabase: "databases",
  dynamodb: "databases",
  mariadb: "databases",
  cassandra: "databases",
  neo4j: "databases",
  oracle: "databases",
  firebase: "databases",

  // Developer Tools
  git: "tools",
  github: "tools",
  gitlab: "tools",
  docker: "tools",
  kubernetes: "tools",
  vite: "tools",
  webpack: "tools",
  eslint: "tools",
  prettier: "tools",
  jest: "tools",
  cypress: "tools",
  playwright: "tools",
  postman: "tools",
  linux: "tools",
  npm: "tools",
  yarn: "tools",
  pnpm: "tools",
  jira: "tools",

  // Cloud Platforms & Infrastructure
  aws: "cloud",
  "amazon web services": "cloud",
  gcp: "cloud",
  "google cloud": "cloud",
  azure: "cloud",
  vercel: "cloud",
  netlify: "cloud",
  cloudflare: "cloud",
  heroku: "cloud",
  digitalocean: "cloud",
  terraform: "cloud",
  ansible: "cloud",
  jenkins: "cloud",

  // AI/ML Technologies
  pytorch: "aiml",
  tensorflow: "aiml",
  "scikit-learn": "aiml",
  keras: "aiml",
  langchain: "aiml",
  openai: "aiml",
  huggingface: "aiml",
  pandas: "aiml",
  numpy: "aiml",
  opencv: "aiml",
  nlp: "aiml",
  llm: "aiml",
  deeplearning: "aiml",

  // Core Computer Science
  "data structures": "coreCs",
  algorithms: "coreCs",
  "object-oriented programming": "coreCs",
  oop: "coreCs",
  "system design": "coreCs",
  "distributed systems": "coreCs",
  "operating systems": "coreCs",
  networking: "coreCs",
  "computer networks": "coreCs",
  database: "coreCs",
};

export const CORE_SOFT_SKILLS = [
  "Agile / Scrum Methodologies",
  "Cross-functional Collaboration",
  "Peer Code Reviews",
  "Technical Documentation",
  "System Architecture Design",
  "Problem Solving & Debugging",
];

/**
 * Organizes an array of confirmed raw skills into strictly categorized groups.
 * Does not add unconfirmed skills from job descriptions.
 */
export function organizeSkillsByCategory(rawSkills: string[]): SkillCategories {
  const result: SkillCategories = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    cloud: [],
    aiml: [],
    softSkills: [...CORE_SOFT_SKILLS],
    other: [],
  };

  const seen = new Set<string>();

  for (const skill of rawSkills) {
    const trimmed = skill.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());

    const lower = trimmed.toLowerCase();
    const mappedCategory = SKILL_DATABASE[lower];

    if (mappedCategory === "coreCs") {
      result.other.push(trimmed);
    } else if (mappedCategory) {
      result[mappedCategory].push(trimmed);
    } else {
      // Heuristic fallback: check if contained in any known key
      let matched = false;
      for (const [key, category] of Object.entries(SKILL_DATABASE)) {
        if (lower === key || lower.startsWith(key + " ") || lower.endsWith(" " + key)) {
          if (category === "coreCs") {
            result.other.push(trimmed);
          } else {
            result[category].push(trimmed);
          }
          matched = true;
          break;
        }
      }

      if (!matched && trimmed.length < 32) {
        result.tools.push(trimmed);
      }
    }
  }

  // Ensure default essential tools if empty
  if (!result.tools.includes("Git")) result.tools.unshift("Git");
  if (!result.tools.includes("GitHub")) result.tools.unshift("GitHub");

  return result;
}
