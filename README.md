# ResumeForge AI — Next-Gen ATS Resume Builder SaaS

> **A production-ready AI-powered resume building platform with real-time ATS scoring, realistic template previews, job description matching, vector text PDF export, and editable DOCX generation.**

![ResumeForge AI](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Highlights & Philosophy

ResumeForge AI is built around a key product principle:
**Candidates must NEVER be forced to generate a resume blindly before seeing what it looks like.**

The entire workflow follows an intentional, recruiter-aligned trajectory:
```
USER DATA ➔ TARGET JOB ➔ CHOOSE RESUME STYLE ➔ SEE REALISTIC TEMPLATE PREVIEW
     ➔ CUSTOMIZE STYLE ➔ AI OPTIMIZATION ➔ GENERATE RESUME ➔ LIVE 3-PANE EDITOR
     ➔ ATS ANALYSIS ➔ VECTOR PDF / DOCX EXPORT
```

---

## ⚡ Core Features

- **Multi-Step Guided Wizard**: 10 clean steps (Personal, Education, Experience, Projects, Skills, Certifications, Achievements, Target Job, Style, Generate).
- **Realistic Miniature Template Previews**: The template selection screen showcases actual scaled resumes rendered from candidate data—never generic placeholder rectangles.
- **6 Recruiter-Approved Templates**:
  - `ATS Professional`: Single-column layout engineered for maximum ATS parser compliance.
  - `Modern Minimal`: Subtle visual hierarchy and clean contemporary typography.
  - `Tech Pro`: Highlighted technical skills, GitHub repositories, and architectural impact.
  - `Student & Fresher`: Prioritizes university coursework, capstones, hackathons, and leadership.
  - `Executive Leader`: Authoritative serif design focused on executive outcomes and strategic milestones.
  - `Creative Professional`: Dynamic typographic balance for design, marketing, and media practitioners.
- **Zero-Data-Loss Template Switching**: Switch templates instantly in the live editor without re-typing or losing content.
- **Strict Honesty Engine**: Improves phrasing, clarity, and Google X-Y-Z action verbs without ever hallucinating fake credentials, unearned degrees, or invented metrics.
- **In-Depth ATS Compatibility Engine**: Computes a 0–100 score with granular diagnostics across Keywords, Structure, Skills, Experience, Readability, and Formatting.
- **Job Description Keyword Matcher**: Paste any job posting to analyze keyword frequency, missing crucial skills, and target role alignment.
- **100% Selectable Vector PDF Generation**: Server-side and client-side vector text rendering without screenshot rasterization.
- **Editable Word (.docx) Generation**: Generates clean Microsoft Word documents with standard heading levels and bullet formatting.
- **Modular Production Auth**: Secure HTTP-only JWT sessions, PBKDF2/scrypt password hashing, and modular Clerk/NextAuth compatibility.
- **Multiple Resume Versions**: Save and duplicate variations (e.g. Frontend vs AI/ML) from a single profile.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons + Radix UI + Framer Motion |
| **Database** | PostgreSQL / SQLite (via Prisma ORM) |
| **State Management** | Zustand (with local draft persistence) |
| **Document Export** | `jspdf` (Vector text PDF) + `docx` (Word processing) |
| **AI Architecture** | Server-side LLM Abstraction (Gemini / OpenAI / Heuristic Engine) |
| **Deployment** | Optimized for Vercel, Supabase, Neon, Railway |

---

## 📂 Project Architecture

```
resumeforge-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/               # AI endpoints (summary, bullets, ATS score, job analysis)
│   │   │   ├── auth/             # Auth endpoints (login, register, logout, me)
│   │   │   └── resume/           # Resume CRUD, versioning, duplicate, PDF & DOCX export
│   │   ├── create/               # 10-step resume creation wizard
│   │   ├── dashboard/            # User dashboard with resume cards & management
│   │   ├── editor/               # 3-pane live editor (edit | preview | AI assistant)
│   │   ├── features/             # Feature capabilities showcase
│   │   ├── pricing/              # Pricing tiers (Free vs Pro)
│   │   ├── templates/            # Template gallery with full-screen preview modals
│   │   ├── layout.tsx            # Global layout with SEO metadata
│   │   └── page.tsx              # High-converting SaaS landing page
│   ├── components/
│   │   ├── editor/               # Live editor sections, preview canvas, AI panel, mobile nav
│   │   ├── navigation/           # Responsive Navbar & Footer
│   │   ├── ui/                   # Reusable UI primitives (Button, Input, Card, Dialog, Badge)
│   │   └── wizard/               # Multi-step creation components
│   ├── lib/
│   │   ├── ai/                   # AI provider abstraction, prompt engine & honesty guardrails
│   │   ├── auth/                 # Modular JWT session & cryptographic security
│   │   ├── db/                   # Prisma database client singleton
│   │   ├── docx/                 # Editable Word document generator
│   │   ├── pdf/                  # Selectable vector PDF generator & client downloader
│   │   ├── sample-data.ts        # Realistic candidate profile (Devesh Sharma)
│   │   └── store/                # Zustand resume state & autosave sync
│   ├── templates/
│   │   ├── ATSProfessional.tsx
│   │   ├── ModernMinimal.tsx
│   │   ├── TechPro.tsx
│   │   ├── Student.tsx
│   │   ├── Executive.tsx
│   │   ├── Creative.tsx
│   │   ├── TemplateRenderer.tsx  # Universal template renderer
│   │   └── registry.ts           # Template metadata & registry
│   └── types/
│       └── resume.ts             # Strict TypeScript schema
├── prisma/
│   └── schema.prisma             # Production database schema
├── tests/                        # Comprehensive test suite (JSON, AI, PDF, DOCX, Auth)
└── package.json
```

---

## 💻 Local Setup & Quickstart

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/resumeforge-ai.git
cd resumeforge-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment settings:
```ini
# Database Connection (Default SQLite for instant local dev; PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# Session Security
AUTH_SECRET="resumeforge-ai-local-development-secret-32-characters-min"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Provider ("gemini" | "openai" | "heuristic")
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
```

> **Note**: Even if no external AI API key is supplied, ResumeForge AI's built-in intelligent heuristic engine handles NLP bullet restructuring and ATS scoring seamlessly out of the box!

### 3. Initialize Database
```bash
npm run prisma:generate
npm run prisma:push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Execute the comprehensive test suite verifying JSON schema validation, AI heuristics, ATS scoring, vector PDF generation, Word DOCX exports, and authentication crypto:
```bash
npm test
```

Expected output:
```
====================================================
   ResumeForge AI — Comprehensive Test Suite        
====================================================

▶ Running Resume JSON Validation Tests...
  ✔ Resume JSON Schema and Content Validated Successfully.
▶ Running AI Engine & ATS Compatibility Tests...
  ✔ AI Engine, ATS Scoring, and Job Match Analysis passed successfully.
▶ Running Vector PDF & Word DOCX Generation Tests...
  ✔ Vector PDF generated successfully (11739 bytes, Header: %PDF)
  ✔ Editable DOCX generated successfully (9968 bytes, Magic: PK)
▶ Running Authentication & Crypto Tests...
  ✔ Password hashing and JWT verification tests passed.

----------------------------------------------------
Results: 4 Passed, 0 Failed
====================================================
🎉 ALL TESTS PASSED SUCCESSFULLY!
```

---

## 🚢 Production Deployment (Vercel + PostgreSQL)

1. **Database**: Provision a managed PostgreSQL database on Neon, Supabase, or AWS RDS.
2. In `prisma/schema.prisma`, update provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set environment variables on Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `GEMINI_API_KEY` (or `OPENAI_API_KEY`)
   - `AI_PROVIDER`
4. Deploy to Vercel via Git:
   ```bash
   vercel --prod
   ```

---

## 📄 License
MIT License. Built with ❤️ for modern job seekers.
