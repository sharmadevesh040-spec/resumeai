import { ProjectItem } from "@/types/resume";
import { ScoredGitHubRepo } from "../import/github-service";

function generateUniqueId(): string {
  return "proj-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Transforms scored GitHub repositories into rich, detailed ProjectItem records.
 * Uses repository description, topics, languages, and README excerpts to synthesize
 * Title, Overview, Technologies, Role/Contribution, and 2-4 comprehensive bullet points.
 */
export function enrichGitHubProjects(repos: ScoredGitHubRepo[]): ProjectItem[] {
  return repos.map((repo) => {
    const formattedTitle = repo.name
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const techStack = repo.technologies && repo.technologies.length > 0
      ? repo.technologies
      : [repo.primaryLanguage || "TypeScript"];

    // Synthesize Project Overview
    const overview = repo.description && repo.description.trim().length > 15
      ? repo.description.trim()
      : `Production-grade open-source software application developed with ${techStack.slice(0, 3).join(", ")}.`;

    const bullets: string[] = [];

    // 1. Evidence-based bullet from README highlights or technical structure
    if (repo.highlights && repo.highlights.length > 0) {
      repo.highlights.slice(0, 3).forEach((h) => {
        let b = h.trim();
        if (!b.endsWith(".")) b += ".";
        bullets.push(b);
      });
    }

    // 2. Add architectural / code implementation bullet if needed
    if (bullets.length < 2) {
      bullets.push(
        `Architected modular application logic utilizing ${techStack.join(", ")}, implementing clean code paradigms and asynchronous data validation pipelines.`
      );
    }

    // 3. Add deployment / open-source traction bullet if stars/live URL exist
    if (repo.stars > 0 || repo.forks > 0) {
      bullets.push(
        `Maintained public open-source repository with ${repo.stars} ${repo.stars === 1 ? "star" : "stars"} and ${repo.forks} ${repo.forks === 1 ? "fork" : "forks"}, overseeing community issues and pull requests.`
      );
    } else if (repo.liveUrl) {
      bullets.push(
        `Configured automated CI/CD build scripts and deployed live demonstration environment, ensuring seamless cross-browser responsiveness.`
      );
    } else if (bullets.length < 3) {
      bullets.push(
        `Structured scalable directory hierarchy, comprehensive unit test suites, and Git-based collaborative workflows for high code maintainability.`
      );
    }

    return {
      id: generateUniqueId(),
      name: formattedTitle,
      overview,
      role: "Lead Author & Open-Source Maintainer",
      description: overview,
      technologies: techStack,
      githubUrl: repo.githubUrl,
      liveUrl: repo.liveUrl,
      projectType: "Open Source",
      highlights: bullets.slice(0, 4),
    };
  });
}
