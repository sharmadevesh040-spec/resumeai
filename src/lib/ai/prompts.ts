export const SYSTEM_HONESTY_INSTRUCTIONS = `
You are an expert ATS resume writer and career strategist.
CRITICAL HONESTY & ACCURACY RULES:
1. NEVER fabricate or invent degrees, employers, job titles, certifications, metrics, percentages, or technologies that the user did not provide.
2. If metrics are missing, DO NOT make up numbers like "improved by 45%" — instead, express qualitative impact and professional outcomes.
3. Transform weak, passive phrasing into active, impact-oriented bullet points using strong action verbs (e.g., Developed, Built, Designed, Implemented, Optimized, Automated, Integrated, Engineered, Analyzed).
4. Strictly return valid, clean JSON according to the specified output schema without extra conversational banter.
`;

export function getSummaryPrompt(data: {
  fullName?: string;
  targetRole?: string;
  experienceLevel?: string;
  currentSummary?: string;
  skills?: string[];
  jobDescription?: string;
}) {
  return `
Task: Write or refine a professional 3-4 sentence resume summary.
Candidate Context:
- Target Role: ${data.targetRole || "Professional"}
- Experience Level: ${data.experienceLevel || "Mid-level"}
- Key Skills: ${data.skills?.join(", ") || "General"}
- User's Raw Input: "${data.currentSummary || ""}"
${data.jobDescription ? `- Target Job Context: ${data.jobDescription.slice(0, 500)}` : ""}

Guidelines:
- State professional identity clearly.
- Highlight candidate's technical/functional competence and value proposition.
- Maintain strict truthfulness based solely on provided inputs.
- Keep tone authoritative, concise, and recruiter-focused.

Output JSON format:
{
  "summary": "...",
  "strengths": ["...", "..."]
}
`;
}

export function getExperienceBulletPrompt(data: {
  role?: string;
  company?: string;
  rawText: string;
  technologies?: string[];
  targetRole?: string;
}) {
  return `
Task: Transform the user's raw experience description into 3-4 high-impact, ATS-optimized bullet points.
Context:
- Role: ${data.role || "Team Member"}
- Company: ${data.company || "Company"}
- Technologies mentioned: ${data.technologies?.join(", ") || "None specified"}
- Target Role: ${data.targetRole || "General"}
- User Raw Description: "${data.rawText}"

Rules:
- Start each bullet with a distinct, compelling past-tense action verb (e.g. Engineered, Spearheaded, Automated, Refactored, Delivered).
- Follow the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]" where qualitative or supplied quantitative outcomes exist.
- Keep each bullet to 1-2 lines.
- DO NOT invent technologies or numbers not stated or implied by the user.

Output JSON format:
{
  "bullets": [
    "...",
    "..."
  ]
}
`;
}

export function getProjectBulletPrompt(data: {
  projectName: string;
  rawDescription: string;
  technologies: string[];
  targetRole?: string;
}) {
  return `
Task: Optimize the description of project "${data.projectName}" into 2-3 impactful resume bullet points.
Technologies: ${data.technologies.join(", ")}
Target Role: ${data.targetRole || "General"}
Raw Description: "${data.rawDescription}"

Rules:
- Highlight the problem solved, technical implementation, and end result.
- Use strong engineering action verbs.
- Only reference the provided technologies (${data.technologies.join(", ")}).

Output JSON format:
{
  "bullets": [
    "...",
    "..."
  ]
}
`;
}

export function getJobAnalysisPrompt(data: {
  jobDescription: string;
  currentSkills: string[];
  targetRole?: string;
}) {
  return `
Task: Perform a deep ATS-level analysis comparing the candidate's skills against the target job description.
Job Description:
"""
${data.jobDescription.slice(0, 3000)}
"""

Candidate's Current Skills:
${data.currentSkills.join(", ")}

Analyze:
1. Required Core Skills in the job description.
2. Preferred / Nice-to-have Skills.
3. Crucial keywords and responsibilities.
4. Skills match percentage and overall job alignment score (0-100).
5. Actionable recommendations to improve alignment WITHOUT lying.

Output JSON format:
{
  "jobMatchScore": 88,
  "skillsMatch": 85,
  "keywordMatch": 90,
  "experienceMatch": 85,
  "educationMatch": 95,
  "requiredSkills": ["..."],
  "preferredSkills": ["..."],
  "missingCrucialSkills": ["..."],
  "identifiedKeywords": ["..."],
  "jobSummary": "Concise 2-sentence summary of the role",
  "recommendations": ["..."]
}
`;
}

export function getATSScorePrompt(data: {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  skills: string[];
}) {
  return `
Task: Calculate an ATS compatibility audit score and comprehensive breakdown for the provided resume.
Target Role: ${data.targetRole}
${data.jobDescription ? `Target Job Description: ${data.jobDescription.slice(0, 1500)}` : ""}

Resume Content:
"""
${data.resumeText.slice(0, 4000)}
"""

Audit dimensions (0-100 each):
- overallScore: overall ATS fitness
- keywordMatch: keyword density and role alignment
- structure: presence of standard sections (Summary, Experience, Projects, Education, Skills)
- skills: relevance and clarity of categorized skills
- experience: active verbs, clarity, impact
- readability: typography, conciseness, absence of clutter
- formatting: cleanliness, ATS parser compatibility

Also provide:
- matchedKeywords
- missingKeywords
- strengths (3-4 items)
- recommendations (3-4 concrete items)
- warnings (any ATS red flags)

Output JSON format:
{
  "overallScore": 92,
  "keywordMatch": 90,
  "structure": 95,
  "skills": 92,
  "experience": 88,
  "readability": 96,
  "formatting": 95,
  "matchedKeywords": ["..."],
  "missingKeywords": ["..."],
  "strengths": ["..."],
  "recommendations": ["..."],
  "warnings": []
}
`;
}
