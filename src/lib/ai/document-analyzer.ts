import { callGemini } from "./gemini";
import { DOCUMENT_ANALYZER_SYSTEM_PROMPT } from "./gemini-prompts";
import {
  DocumentExtractedProfileSchema,
  DocumentExtractedProfile,
} from "./gemini-schemas";
import { parseLinkedInPdfText } from "../import/linkedin-service";

export interface DocumentAnalysisInput {
  rawText?: string;
  documentText?: string;
  pdfBuffer?: Buffer;
  filename?: string;
  sourceType?: "linkedin_pdf" | "resume_pdf" | "cv";
}

/**
 * Extracts structured profile data from an uploaded resume, CV, or LinkedIn PDF export using Gemini.
 */
export async function extractProfileFromDocumentWithGemini(
  input: DocumentAnalysisInput
): Promise<DocumentExtractedProfile> {
  let extractedText = input.rawText || input.documentText || "";

  // If buffer provided without rawText, extract text using pdf-parse
  if (!extractedText && input.pdfBuffer) {
    try {
      const pdfModule: any = await import("pdf-parse");
      const pdfParse = typeof pdfModule === "function" ? pdfModule : pdfModule.default || pdfModule;
      const pdfData = await pdfParse(input.pdfBuffer);
      extractedText = pdfData?.text || "";
    } catch (e) {
      extractedText = input.pdfBuffer.toString("utf-8");
    }
  }

  const prompt = `
Extract all authentic candidate information from this document:
- Document Filename: "${input.filename || "Uploaded_Document.pdf"}"
- Document Type: "${input.sourceType || "resume_pdf"}"
- Extracted Document Text:
"""
${extractedText.slice(0, 8000)}
"""

Extract and populate:
1. personal: fullName, headline, email, phone, location, linkedin, github, portfolio
2. summary: professional summary if present
3. experiences: array of { role, company, location, startDate, endDate, isCurrent, description, highlights }
4. education: array of { institution, degree, fieldOfStudy, startYear, endYear, gpa }
5. skills: list of verified technical and professional skills
6. certifications: array of certified credentials
7. achievements: honors and awards
8. links: professional URLs found in the document

Do NOT fabricate details that do not exist in the text.
`;

  return callGemini<DocumentExtractedProfile>({
    systemInstruction: DOCUMENT_ANALYZER_SYSTEM_PROMPT,
    prompt,
    schema: DocumentExtractedProfileSchema,
    taskType: "complex",
    operationName: "document_analyzer",
    fallbackFn: () => {
      // Deterministic fallback using existing text parser
      const parsedLi = parseLinkedInPdfText(extractedText);
      const lines = extractedText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const firstLineCandidate = lines.find(
        (l) => l.length >= 2 && l.length < 50 && !l.includes("@") && !l.includes("http") && !l.includes("|")
      );
      const determinedName = parsedLi.fullName || firstLineCandidate || "Candidate";

      return {
        personal: {
          fullName: determinedName,
          headline: parsedLi.headline || "",
          email: parsedLi.email || "",
          phone: parsedLi.phone || "",
          location: parsedLi.location || "",
          linkedin: parsedLi.linkedinUrl || "",
          github: "",
          portfolio: "",
        },
        summary: parsedLi.summary || "",
        experiences: parsedLi.experiences.map((e) => ({
          role: e.role,
          company: e.company,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent,
          description: e.description,
          highlights: e.highlights || [],
        })),
        education: parsedLi.education.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear,
          endYear: edu.endYear,
        })),
        skills: parsedLi.skills,
        certifications: parsedLi.certifications,
        achievements: parsedLi.honors,
        links: parsedLi.linkedinUrl ? [parsedLi.linkedinUrl] : [],
      };
    },
  });
}
