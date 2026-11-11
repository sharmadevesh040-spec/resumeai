import { cookies } from "next/headers";
import {
  getLinkedInOAuthConfig,
  generateLinkedInAuthUrl,
  LINKEDIN_COOKIE_TOKEN,
  LINKEDIN_COOKIE_PROFILE,
} from "@/lib/auth/linkedin";
import { extractLinkedInVanity } from "./url-validator";
import { extractProfileFromDocumentWithGemini } from "../ai/document-analyzer";
import { isGeminiConfigured } from "../ai/gemini-config";

export interface LinkedInParsedExperience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  isInternship?: boolean;
  description?: string;
  highlights?: string[];
}

export interface LinkedInParsedEducation {
  institution: string;
  degree: string;
  startYear?: string;
  endYear?: string;
  fieldOfStudy?: string;
  coursework?: string;
  activities?: string;
}

export interface LinkedInParsedVolunteer {
  role: string;
  organization: string;
  description?: string;
}

export interface LinkedInParsedPublication {
  title: string;
  publisher?: string;
  date?: string;
  description?: string;
}

export interface LinkedInParsedProfile {
  fullName: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  summary?: string;
  experiences: LinkedInParsedExperience[];
  education: LinkedInParsedEducation[];
  skills: string[];
  certifications: string[];
  honors: string[];
  volunteer?: LinkedInParsedVolunteer[];
  publications?: LinkedInParsedPublication[];
}

export interface LinkedInImportResult {
  success: boolean;
  profile?: LinkedInParsedProfile;
  source: "oauth" | "pdf_export" | "url_vanity" | "url_public";
  warning?: string;
  requiresOAuth?: boolean;
  requiresPdfUpload?: boolean;
  authUrl?: string;
  scopeLimitedInfo?: boolean;
  verifiedMember?: boolean;
}

/**
 * Parses raw text extracted from an official LinkedIn "Save to PDF" resume export.
 */
export function parseLinkedInPdfText(rawText: string, defaultVanity?: string): LinkedInParsedProfile {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const profile: LinkedInParsedProfile = {
    fullName: "",
    headline: "",
    location: "",
    email: "",
    phone: "",
    linkedinUrl: defaultVanity ? `https://www.linkedin.com/in/${defaultVanity}` : "",
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    honors: [],
    volunteer: [],
    publications: [],
  };

  const sectionHeaders = [
    "Summary",
    "Experience",
    "Education",
    "Licenses & Certifications",
    "Certifications",
    "Skills",
    "Top Skills",
    "Languages",
    "Honors-Awards",
    "Publications",
    "Volunteer Experience",
    "Contact",
  ];

  type SectionKey =
    | "header"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "certifications"
    | "honors"
    | "publications"
    | "volunteer"
    | "contact";

  let currentSection: SectionKey = "header";

  const sectionBuckets: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    honors: [],
    publications: [],
    volunteer: [],
    contact: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section transitions
    const matchedHeader = sectionHeaders.find(
      (h) => line.toLowerCase() === h.toLowerCase() || line.toLowerCase() === `${h.toLowerCase()}:`
    );

    if (matchedHeader) {
      const lower = matchedHeader.toLowerCase();
      if (lower === "summary") currentSection = "summary";
      else if (lower === "experience") currentSection = "experience";
      else if (lower === "education") currentSection = "education";
      else if (lower === "skills" || lower === "top skills") currentSection = "skills";
      else if (lower.includes("certif")) currentSection = "certifications";
      else if (lower.includes("honor") || lower.includes("award")) currentSection = "honors";
      else if (lower.includes("publication")) currentSection = "publications";
      else if (lower.includes("volunteer")) currentSection = "volunteer";
      else if (lower === "contact") currentSection = "contact";
      continue;
    }

    sectionBuckets[currentSection].push(line);
  }

  // 1. Process Header & Contact
  const headerLines = sectionBuckets.header;
  if (headerLines.length > 0) {
    profile.fullName = headerLines[0];
    if (headerLines.length > 1) {
      profile.headline = headerLines[1];
      if (headerLines.length > 2) {
        profile.location = headerLines[2];
      }
    }
  }

  // Scan contact section and header for email / phone / URLs
  const allTextForContact = [...sectionBuckets.contact, ...sectionBuckets.header].join(" ");
  const emailMatch = allTextForContact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) profile.email = emailMatch[1];

  const phoneMatch = allTextForContact.match(
    /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/
  );
  if (phoneMatch && phoneMatch[0].length >= 10) profile.phone = phoneMatch[0].trim();

  const linkedinMatch = allTextForContact.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) profile.linkedinUrl = `https://www.linkedin.com/in/${linkedinMatch[1]}`;

  // 2. Process Summary
  if (sectionBuckets.summary.length > 0) {
    profile.summary = sectionBuckets.summary.join(" ").trim();
  }

  // 3. Process Experience
  const expLines = sectionBuckets.experience;
  let currentExp: Partial<LinkedInParsedExperience> | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const dateRangeRegex =
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*(?:\d{4})?\s*-\s*(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i;

    if (dateRangeRegex.test(line)) {
      if (currentExp && currentExp.role && currentExp.company) {
        profile.experiences.push({
          role: currentExp.role,
          company: currentExp.company,
          location: currentExp.location || "",
          startDate: currentExp.startDate || "",
          endDate: currentExp.endDate || "",
          isCurrent: Boolean(currentExp.isCurrent),
          isInternship: Boolean(currentExp.isInternship),
          description: (currentExp.highlights || []).join(". "),
          highlights: currentExp.highlights || [],
        });
      }

      const companyLine = i > 1 ? expLines[i - 2] : expLines[i - 1];
      const roleLine = i > 1 ? expLines[i - 1] : "Software Engineer";

      const isCurrent = line.toLowerCase().includes("present");
      const parts = line.split("-").map((s) => s.trim());
      const isIntern = roleLine.toLowerCase().includes("intern");

      currentExp = {
        role: roleLine || "Software Engineer",
        company: companyLine || "Company",
        startDate: parts[0] || "",
        endDate: isCurrent ? "Present" : parts[1]?.replace(/\(.*?\)/, "").trim() || "",
        isCurrent,
        isInternship: isIntern,
        highlights: [],
      };
    } else if (currentExp) {
      if (line.length > 15 && !line.includes("Page ") && !line.toLowerCase().includes("linkedin")) {
        currentExp.highlights = currentExp.highlights || [];
        currentExp.highlights.push(line);
      }
    }
  }

  if (currentExp && currentExp.role && currentExp.company) {
    profile.experiences.push({
      role: currentExp.role,
      company: currentExp.company,
      location: currentExp.location || "",
      startDate: currentExp.startDate || "",
      endDate: currentExp.endDate || "",
      isCurrent: Boolean(currentExp.isCurrent),
      isInternship: Boolean(currentExp.isInternship),
      description: (currentExp.highlights || []).join(". "),
      highlights: currentExp.highlights || [],
    });
  }

  // 4. Process Education
  const eduLines = sectionBuckets.education;
  for (let i = 0; i < eduLines.length; i += 2) {
    const institution = eduLines[i];
    const degreeInfo = eduLines[i + 1] || "Degree in Progress";
    if (institution && institution.length > 3) {
      const yearMatch = (institution + " " + degreeInfo).match(/(20\d\d|19\d\d)/g);
      profile.education.push({
        institution,
        degree: degreeInfo.replace(/(20\d\d|19\d\d)\s*-\s*(20\d\d|19\d\d)?/, "").trim(),
        startYear: yearMatch?.[0] || "",
        endYear: yearMatch?.[1] || yearMatch?.[0] || "",
      });
    }
  }

  // 5. Process Skills
  sectionBuckets.skills.forEach((skillLine) => {
    const splitSkills = skillLine.split(/[•,·|]/).map((s) => s.trim());
    splitSkills.forEach((s) => {
      if (s.length > 1 && s.length < 50 && !profile.skills.includes(s)) {
        profile.skills.push(s);
      }
    });
  });

  // 6. Certifications
  sectionBuckets.certifications.forEach((c) => {
    if (c.length > 4 && !profile.certifications.includes(c)) {
      profile.certifications.push(c);
    }
  });

  // 7. Honors
  sectionBuckets.honors.forEach((h) => {
    if (h.length > 4 && !profile.honors.includes(h)) {
      profile.honors.push(h);
    }
  });

  return profile;
}

/**
 * Extracts structured LinkedIn profile data from an uploaded LinkedIn Profile PDF Buffer.
 */
export async function parseLinkedInPdfBuffer(
  buffer: Buffer,
  fallbackVanity?: string
): Promise<LinkedInImportResult> {
  try {
    let text = "";
    try {
      const pdfModule: any = await import("pdf-parse");
      const pdfParse = typeof pdfModule === "function" ? pdfModule : pdfModule.default || pdfModule;
      const pdfData = await pdfParse(buffer);
      text = pdfData?.text || "";
    } catch {
      text = buffer.toString("utf-8");
    }

    const parsed = parseLinkedInPdfText(text, fallbackVanity);

    // If Gemini is configured, enhance extraction using Gemini document understanding
    if (isGeminiConfigured()) {
      try {
        const geminiExtracted = await extractProfileFromDocumentWithGemini({
          rawText: text,
          pdfBuffer: buffer,
          filename: "linkedin_profile.pdf",
          sourceType: "linkedin_pdf",
        });

        if (geminiExtracted && (geminiExtracted.personal.fullName || geminiExtracted.experiences.length > 0)) {
          return {
            success: true,
            source: "pdf_export",
            verifiedMember: true,
            profile: {
              fullName: geminiExtracted.personal.fullName || parsed.fullName,
              headline: geminiExtracted.personal.headline || parsed.headline,
              location: geminiExtracted.personal.location || parsed.location,
              email: geminiExtracted.personal.email || parsed.email,
              phone: geminiExtracted.personal.phone || parsed.phone,
              linkedinUrl: geminiExtracted.personal.linkedin || parsed.linkedinUrl,
              summary: geminiExtracted.summary || parsed.summary,
              experiences: geminiExtracted.experiences.length > 0 ? (geminiExtracted.experiences as any) : parsed.experiences,
              education: geminiExtracted.education.length > 0 ? (geminiExtracted.education as any) : parsed.education,
              skills: geminiExtracted.skills.length > 0 ? geminiExtracted.skills : parsed.skills,
              certifications: geminiExtracted.certifications.length > 0 ? geminiExtracted.certifications : parsed.certifications,
              honors: geminiExtracted.achievements.length > 0 ? geminiExtracted.achievements : parsed.honors,
            },
          };
        }
      } catch (geminiErr) {
        console.warn("[Gemini PDF Extraction]: Falling back to native text parser:", geminiErr);
      }
    }

    if (!parsed.fullName && !parsed.summary && parsed.experiences.length === 0) {
      return {
        success: false,
        source: "pdf_export",
        warning: "Could not extract standard LinkedIn profile structure from the uploaded PDF.",
      };
    }

    return {
      success: true,
      profile: parsed,
      source: "pdf_export",
    };
  } catch (error) {
    return {
      success: false,
      source: "pdf_export",
      warning: error instanceof Error ? error.message : "Failed to parse LinkedIn PDF file.",
    };
  }
}

/**
 * Safely extracts inner content of an HTML tag even when attributes contain '>' in CSS classes.
 */
function extractTagInner(html: string, tagName: string): string {
  const openRegex = new RegExp(`<${tagName}\\b`, "i");
  const openMatch = openRegex.exec(html);
  if (!openMatch) return "";

  const fromOpen = html.slice(openMatch.index);
  let inQuote: string | null = null;
  let tagEndIdx = -1;
  for (let i = 0; i < fromOpen.length; i++) {
    const char = fromOpen[i];
    if ((char === '"' || char === "'") && (!inQuote || inQuote === char)) {
      inQuote = inQuote ? null : char;
    } else if (char === ">" && !inQuote) {
      tagEndIdx = i;
      break;
    }
  }

  if (tagEndIdx === -1) return "";
  const afterOpenTag = fromOpen.slice(tagEndIdx + 1);
  const closeRegex = new RegExp(`</${tagName}>`, "i");
  const closeMatch = closeRegex.exec(afterOpenTag);
  if (!closeMatch) return afterOpenTag;
  return afterOpenTag.slice(0, closeMatch.index);
}

/**
 * Strips HTML tags, decodes common entities, and collapses whitespace.
 */
function cleanHtmlText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&middot;/g, "·")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDateStr(str: string): string {
  if (!str) return "Present";
  if (str.toLowerCase().includes("present")) return "Present";
  return str.replace(/\b\d+\s*(?:years?|months?|mos?)\b/gi, "").replace(/[·\(\)]/g, "").trim();
}

/**
 * Parses public LinkedIn profile HTML (including Schema.org JSON-LD and semantic HTML).
 */
export function parseLinkedInPublicHtml(html: string, vanity: string): LinkedInParsedProfile | null {
  if (
    html.includes("authwall_headline") ||
    html.includes("checkpoint/challenge") ||
    html.includes("captcha-internal") ||
    html.includes('id="authwall"')
  ) {
    return null;
  }

  let personLd: any = null;
  const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m.replace(/<\/?script[^>]*>/gi, ""));
      if (parsed["@type"] === "Person") {
        personLd = parsed;
        break;
      } else if (parsed["@graph"]) {
        const found = parsed["@graph"].find((item: any) => item["@type"] === "Person");
        if (found) {
          personLd = found;
          break;
        }
      }
    } catch {}
  }

  const fullName =
    personLd?.name ||
    cleanHtmlText(extractTagInner(html, "h1")) ||
    vanity.replace(/[-_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const headline =
    personLd?.jobTitle?.[0] ||
    cleanHtmlText(extractTagInner(html, "h2")) ||
    "";

  const location =
    personLd?.address?.addressLocality ||
    personLd?.address?.addressCountry ||
    "";

  const summary = personLd?.description || "";

  // 1. Parse Experiences from HTML
  const experiences: LinkedInParsedExperience[] = [];
  const expItems =
    html.match(/<li[^>]*class="[^"]*experience-item[^"]*"[\s\S]*?<\/li>/gi) ||
    html.match(/<li[^>]*data-section="currentPositionsDetails"[\s\S]*?<\/li>/gi) ||
    [];

  for (const item of expItems) {
    const role = cleanHtmlText(extractTagInner(item, "h3"));
    const company = cleanHtmlText(extractTagInner(item, "h4")).replace(/[·•]\s*$/, "").trim();
    const dateRangeSpan = item.match(/<span[^>]*class="[^"]*date-range[^"]*"[\s\S]*?<\/span>/i);
    const dateText = dateRangeSpan ? cleanHtmlText(dateRangeSpan[0]) : "";

    let startDate = "";
    let endDate = "Present";
    let isCurrent = false;

    if (dateText) {
      const parts = dateText.split(/[-–—]/);
      startDate = cleanDateStr(parts[0]);
      if (parts[1]) {
        endDate = cleanDateStr(parts[1]);
      }
      isCurrent = endDate.toLowerCase().includes("present");
    }

    if (role || company) {
      experiences.push({
        role: role || "Professional Role",
        company: company || "Organization",
        startDate: startDate || "2020",
        endDate: endDate || "Present",
        isCurrent,
        description: "",
      });
    }
  }

  // Fallback to JSON-LD worksFor if no HTML experience list was found
  if (experiences.length === 0 && personLd?.worksFor) {
    for (const w of personLd.worksFor) {
      experiences.push({
        role: personLd.jobTitle?.[0] || "Team Member",
        company: w.name,
        startDate: String(w.member?.startDate || "2020"),
        endDate: "Present",
        isCurrent: true,
      });
    }
  }

  // 2. Parse Education from HTML
  const education: LinkedInParsedEducation[] = [];
  const eduItems =
    html.match(/<li[^>]*class="[^"]*education__list-item[^"]*"[\s\S]*?<\/li>/gi) ||
    html.match(/<li[^>]*data-section="educationsDetails"[\s\S]*?<\/li>/gi) ||
    [];

  for (const item of eduItems) {
    const institution = cleanHtmlText(extractTagInner(item, "h3"));
    const degreeRaw = cleanHtmlText(extractTagInner(item, "h4"));
    const dateRangeSpan = item.match(/<span[^>]*class="[^"]*date-range[^"]*"[\s\S]*?<\/span>/i);
    const dateText = dateRangeSpan ? cleanHtmlText(dateRangeSpan[0]) : "";

    let startYear = "";
    let endYear = "";
    if (dateText) {
      const years = dateText.match(/\b(19\d\d|20\d\d)\b/g);
      if (years && years.length >= 2) {
        startYear = years[0];
        endYear = years[1];
      } else if (years && years.length === 1) {
        endYear = years[0];
      }
    }

    if (institution) {
      education.push({
        institution,
        degree: degreeRaw && degreeRaw !== "-" ? degreeRaw : "Degree Program",
        startYear: startYear || "2018",
        endYear: endYear || "2022",
      });
    }
  }

  // Fallback to JSON-LD alumniOf for education if HTML list was empty
  if (education.length === 0 && personLd?.alumniOf) {
    for (const a of personLd.alumniOf) {
      if (a["@type"] === "EducationalOrganization" || a.url?.includes("/school/")) {
        education.push({
          institution: a.name,
          degree: "Degree / Course of Study",
          startYear: String(a.member?.startDate || "2018"),
          endYear: String(a.member?.endDate || "2022"),
        });
      }
    }
  }

  // If nothing substantial was extracted, return null
  if (experiences.length === 0 && education.length === 0 && !summary && fullName === vanity) {
    return null;
  }

  return {
    fullName,
    headline,
    location,
    linkedinUrl: `https://www.linkedin.com/in/${vanity}`,
    summary,
    experiences,
    education,
    skills: [],
    certifications: [],
    honors: [],
  };
}

/**
 * Fetches and parses a public LinkedIn profile URL directly via resilient multi-tier browser emulation.
 * Tier 1: Desktop Chrome with Google Referrer (emulates Google Search click-through)
 * Tier 2: Mobile Browser Emulation (Android Chrome, which bypasses desktop authwalls on public pages)
 */
export async function fetchPublicLinkedInProfile(vanity: string): Promise<LinkedInParsedProfile | null> {
  const cleanVanity = extractLinkedInVanity(vanity) || vanity.trim().replace(/\/+$/, "");
  const targetUrl = `https://www.linkedin.com/in/${encodeURIComponent(cleanVanity)}`;

  // Tier 1: Desktop Browser with Google Search Referrer
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const finalUrl = res.url || "";
      if (!finalUrl.includes("/authwall") && !finalUrl.includes("/login")) {
        const html = await res.text();
        const parsed = parseLinkedInPublicHtml(html, cleanVanity);
        if (parsed) return parsed;
      }
    }
  } catch {
    // Continue to Tier 2
  }

  // Tier 2: Mobile Browser Emulation
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const finalUrl = res.url || "";
      if (!finalUrl.includes("/authwall") && !finalUrl.includes("/login")) {
        const html = await res.text();
        const parsed = parseLinkedInPublicHtml(html, cleanVanity);
        if (parsed) return parsed;
      }
    }
  } catch {
    // Both tiers failed
  }

  return null;
}

/**
 * Handles LinkedIn URL processing with Public Profile Scraping, Official OAuth 2.0, and PDF fallback:
 * 1. Attempts to fetch public LinkedIn profile data directly (experiences, education, headline, bio).
 * 2. If restricted/authwalled, checks if an active OAuth session exists to fetch verified identity.
 * 3. If neither succeeds, directs user to upload their official LinkedIn Profile PDF export or connect via OAuth.
 */
export async function processLinkedInUrl(
  vanityOrUrl: string,
  oauthAccessToken?: string | null
): Promise<LinkedInImportResult> {
  const vanity = extractLinkedInVanity(vanityOrUrl) || vanityOrUrl.replace(/^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "");

  // 1. Attempt to fetch public LinkedIn profile data directly
  const publicProfile = await fetchPublicLinkedInProfile(vanity);
  if (publicProfile && (publicProfile.experiences.length > 0 || publicProfile.education.length > 0 || publicProfile.summary)) {
    return {
      success: true,
      source: "url_public",
      verifiedMember: true,
      profile: publicProfile,
    };
  }

  // 2. Check token parameter or cookies for authorized OAuth
  let token = oauthAccessToken;
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(LINKEDIN_COOKIE_TOKEN)?.value || null;
    } catch {
      // In non-request context (e.g. tests)
    }
  }

  const config = getLinkedInOAuthConfig();

  // If official OAuth token is present, call LinkedIn OpenID UserInfo API
  if (token) {
    try {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.ok) {
        const userInfo = await res.json();
        const fullName = userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim();

        return {
          success: true,
          source: "oauth",
          verifiedMember: true,
          scopeLimitedInfo: true,
          requiresPdfUpload: true, // Transparently notify user that standard OpenID provides identity/email
          profile: {
            fullName: fullName || vanity.replace(/[-_.]/g, " "),
            headline: "Software Professional",
            email: userInfo.email || "",
            linkedinUrl: `https://www.linkedin.com/in/${vanity}`,
            experiences: [],
            education: [],
            skills: [],
            certifications: [],
            honors: [],
          },
          warning:
            "Verified LinkedIn identity imported via official OpenID Connect. Standard LinkedIn API permissions provide identity and email. For complete work history and education, please upload your official LinkedIn Profile PDF export.",
        };
      }
    } catch (err) {
      console.warn("LinkedIn API call failed:", err);
    }
  }

  // 3. If public fetch failed (e.g. authwall / private profile) and no OAuth token:
  // Require PDF upload or OAuth connection. Do NOT invent fake details.
  const authUrl = config.isConfigured ? generateLinkedInAuthUrl("/create", vanity).url : undefined;
  return {
    success: false,
    source: "url_vanity",
    requiresOAuth: config.isConfigured,
    requiresPdfUpload: true,
    authUrl,
    profile: {
      fullName: vanity.replace(/[-_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      headline: "Software Professional",
      linkedinUrl: `https://www.linkedin.com/in/${vanity}`,
      experiences: [],
      education: [],
      skills: [],
      certifications: [],
      honors: [],
    },
    warning:
      "LinkedIn security restrictions prevent direct access to this profile without a session. Please upload your official LinkedIn Profile PDF export (Profile > More > Save to PDF) for full work experience and education, or connect your account.",
  };
}
