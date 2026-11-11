import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  provider: "github" | "linkedin" | "unknown";
  username?: string;
  normalizedUrl?: string;
  error?: string;
}

const RESERVED_GITHUB_USERNAMES = new Set([
  "explore",
  "topics",
  "trending",
  "collections",
  "events",
  "features",
  "enterprise",
  "pricing",
  "settings",
  "organizations",
  "orgs",
  "login",
  "logout",
  "join",
  "dashboard",
  "pulls",
  "issues",
  "notifications",
  "marketplace",
]);

/**
 * Validates and extracts username from a GitHub profile URL or bare username.
 */
export function validateGitHubUrl(rawInput?: string | null): ValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return { isValid: false, provider: "github", error: "GitHub URL is empty" };
  }

  const trimmed = rawInput.trim();

  // Pattern matching github profile URLs
  // e.g. https://github.com/torvalds, https://www.github.com/torvalds/, github.com/torvalds
  const githubUrlRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/?$/i;
  const match = trimmed.match(githubUrlRegex);

  let username: string | undefined;

  if (match) {
    username = match[1];
  } else {
    // If user provided a raw username like "torvalds" or "@torvalds"
    const bareUsernameRegex = /^@?([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/;
    const bareMatch = trimmed.match(bareUsernameRegex);
    if (bareMatch && !trimmed.includes("/") && !trimmed.includes(".")) {
      username = bareMatch[1];
    }
  }

  if (!username) {
    return {
      isValid: false,
      provider: "github",
      error: "Invalid GitHub profile URL or username format (e.g., https://github.com/username)",
    };
  }

  if (RESERVED_GITHUB_USERNAMES.has(username.toLowerCase())) {
    return {
      isValid: false,
      provider: "github",
      error: `"${username}" is a reserved GitHub system keyword, not a user profile.`,
    };
  }

  return {
    isValid: true,
    provider: "github",
    username,
    normalizedUrl: `https://github.com/${username}`,
  };
}

const RESERVED_LINKEDIN_PATHS = new Set([
  "feed",
  "jobs",
  "mynetwork",
  "messaging",
  "notifications",
  "search",
  "learning",
  "salary",
  "post",
  "pulse",
  "settings",
  "login",
  "logout",
  "authwall",
]);

/**
 * Extracts and cleans a LinkedIn vanity username from any full URL, subpath, or partial string.
 * Handles query strings, mobile share links, regional subdomains (in.linkedin.com, uk.linkedin.com), etc.
 */
export function extractLinkedInVanity(rawInput?: string | null): string | null {
  if (!rawInput || typeof rawInput !== "string") return null;
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. Try URL parsing if input looks like a full URL
  try {
    const urlStr = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlStr);

    if (/linkedin\.[a-z]{2,6}$/i.test(parsed.hostname)) {
      const match = parsed.pathname.match(/\/in\/([^\/?#]+)/i);
      if (match) {
        let vanity = decodeURIComponent(match[1]).trim().replace(/\/+$/, "");
        vanity = vanity.replace(/[?#].*$/, "");
        if (vanity.length >= 2 && !RESERVED_LINKEDIN_PATHS.has(vanity.toLowerCase())) {
          return vanity;
        }
      }
    }
  } catch {
    // Continue to regex fallback
  }

  // 2. Comprehensive regex extraction for copy-pasted links, mobile shares, or vanity usernames
  let clean = trimmed;
  clean = clean.replace(/^[a-zA-Z]+:\/\//, ""); // remove protocol
  clean = clean.replace(/^(?:[a-zA-Z0-9_-]+\.)*linkedin\.[a-z]{2,6}\/in\//i, ""); // remove domain + /in/
  clean = clean.replace(/^in\//i, ""); // remove leading in/
  clean = clean.replace(/^@/, ""); // remove leading @
  clean = clean.replace(/[?#][\s\S]*$/, ""); // strip query parameters and hash fragments
  clean = clean.replace(/\/(?:details|overlay|recent-activity)[\s\S]*$/i, ""); // strip subpaths
  clean = clean.replace(/\/+$/, ""); // strip trailing slashes

  if (/^[a-zA-Z0-9_\-\.]{2,100}$/.test(clean)) {
    if (!RESERVED_LINKEDIN_PATHS.has(clean.toLowerCase())) {
      return clean;
    }
  }

  return null;
}

/**
 * Validates and extracts username/vanity name from a LinkedIn profile URL.
 */
export function validateLinkedInUrl(rawInput?: string | null): ValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return { isValid: false, provider: "linkedin", error: "LinkedIn URL is empty" };
  }

  const username = extractLinkedInVanity(rawInput);

  if (!username) {
    return {
      isValid: false,
      provider: "linkedin",
      error: "Invalid LinkedIn profile URL or username format (e.g., https://linkedin.com/in/username)",
    };
  }

  return {
    isValid: true,
    provider: "linkedin",
    username,
    normalizedUrl: `https://www.linkedin.com/in/${username}`,
  };
}

/**
 * Validates the combined one-click import inputs.
 * At least one valid profile link (GitHub or LinkedIn) must be provided.
 */
export const AutoImportRequestSchema = z.object({
  linkedinUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  targetRole: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  // Optional base resume id if user wants to update an existing one instead of creating new
  targetResumeId: z.string().optional().nullable(),
}).refine(
  (data) => {
    const hasLinkedIn = Boolean(data.linkedinUrl && data.linkedinUrl.trim().length > 0);
    const hasGitHub = Boolean(data.githubUrl && data.githubUrl.trim().length > 0);
    return hasLinkedIn || hasGitHub;
  },
  {
    message: "At least one profile link (LinkedIn or GitHub) is required to import.",
    path: ["githubUrl"],
  }
);

export type AutoImportRequest = z.infer<typeof AutoImportRequestSchema>;
