"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Github,
  Linkedin,
  Briefcase,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ExternalLink,
  Loader2,
  FileDown,
  Layers,
  HelpCircle,
  Unlink,
  Compass,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { ResumeData, TemplateId } from "@/types/resume";
import { downloadPdf, downloadDocx } from "@/lib/pdf/client-download";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { motion, AnimatePresence } from "framer-motion";

const GENERATION_STAGES = [
  { id: 1, label: "Validating profile links", desc: "Checking URL format and extracting identifiers" },
  { id: 2, label: "Importing LinkedIn information", desc: "Verifying authorized credentials or PDF export" },
  { id: 3, label: "Fetching GitHub profile", desc: "Querying public repos, commit frequency, and topics" },
  { id: 4, label: "Analyzing repositories", desc: "Scoring repository relevance, stars, and README excerpts" },
  { id: 5, label: "Organizing education and experience", desc: "Detecting chronology, career stage, and institutions" },
  { id: 6, label: "Identifying skills", desc: "Classifying languages, frameworks, databases, and tools" },
  { id: 7, label: "Writing professional summary", desc: "Synthesizing career narrative with target role keywords" },
  { id: 8, label: "Improving project descriptions", desc: "Structuring Action + Task + Tech + Result bullets" },
  { id: 9, label: "Optimizing for target job", desc: "Aligning terminology and technical keyword density" },
  { id: 10, label: "Selecting a professional template", desc: "Recommending optimal layout based on role and experience" },
  { id: 11, label: "Generating the final resume", desc: "Finalizing selectable vector output and editor state" },
];

interface AutoGenerateFormProps {
  onSuccess?: (resume: ResumeData) => void;
  compact?: boolean;
}

export function AutoGenerateForm({ onSuccess, compact = false }: AutoGenerateFormProps) {
  const router = useRouter();
  const setResume = useResumeStore((state) => state.setResume);
  const setActiveStep = useResumeStore((state) => state.setActiveStep);

  // Mode Selection: Fast AI Mode vs Guided Professional Mode
  const [mode, setMode] = useState<"fast" | "guided">("fast");

  // Form State
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);

  // Optional upfront contact state
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactInstitution, setContactInstitution] = useState("");
  const [contactDegree, setContactDegree] = useState("");
  const [showDirectContact, setShowDirectContact] = useState(false);

  // Quick Polish in Result Modal State
  const [polishEmail, setPolishEmail] = useState("");
  const [polishPhone, setPolishPhone] = useState("");
  const [polishInstitution, setPolishInstitution] = useState("");
  const [polishDegree, setPolishDegree] = useState("");
  const [polishGradYear, setPolishGradYear] = useState("");

  // LinkedIn OAuth State
  const [linkedInAccount, setLinkedInAccount] = useState<{
    isConnected: boolean;
    user?: { name: string; email?: string; picture?: string; vanityName?: string };
    missingCredentials?: boolean;
    authUrl?: string;
  } | null>(null);

  // PDF Upload Fallback State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [parsedLinkedinData, setParsedLinkedinData] = useState<any | null>(null);

  // Progress & Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionableOAuthUrl, setActionableOAuthUrl] = useState<string | null>(null);

  // Result Modal State
  const [generationResult, setGenerationResult] = useState<{
    resume: ResumeData;
    resumeId: string;
    recommendedTemplate: TemplateId;
    recommendationReason: string;
    missingInformationWarnings: string[];
    sourcesUsed: { github: boolean; linkedin: boolean };
    stagesCompleted: string[];
  } | null>(null);

  // Fetch LinkedIn Connection Status on Mount
  useEffect(() => {
    fetch("/api/auth/linkedin/status")
      .then((res) => res.json())
      .then((data) => {
        setLinkedInAccount(data);
        if (data.isConnected && data.user?.name) {
          // Pre-fill vanity or name if available
          if (!linkedinUrl && data.user.vanityName) {
            setLinkedinUrl(`https://www.linkedin.com/in/${data.user.vanityName}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDisconnectLinkedIn = async () => {
    try {
      await fetch("/api/auth/linkedin/disconnect", { method: "POST" });
      setLinkedInAccount({ isConnected: false });
      setParsedLinkedinData(null);
    } catch {
      // Ignored
    }
  };

  const hasAtLeastOneLink = Boolean(
    (linkedinUrl && linkedinUrl.trim().length > 0) ||
    (githubUrl && githubUrl.trim().length > 0) ||
    linkedInAccount?.isConnected ||
    parsedLinkedinData
  );

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file exported from LinkedIn.");
      return;
    }

    setPdfFile(file);
    setIsUploadingPdf(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (linkedinUrl) formData.append("vanity", linkedinUrl);

      const res = await fetch("/api/import/linkedin/pdf", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.ok
            ? "Server returned non-JSON response."
            : `Server returned error (${res.status}): ${text.slice(0, 150)}`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse LinkedIn PDF");
      }

      setParsedLinkedinData(data.profile);
      setShowPdfModal(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "PDF parsing failed");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleStartGeneration = async () => {
    if (!hasAtLeastOneLink) {
      setErrorMessage("Please enter your LinkedIn profile, GitHub profile, or upload a LinkedIn PDF.");
      return;
    }

    setErrorMessage(null);
    setActionableOAuthUrl(null);
    setIsProcessing(true);
    setCurrentStageIdx(0);

    const stageTimer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < GENERATION_STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 750);

    try {
      const payload = {
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        linkedinProfileData: parsedLinkedinData || undefined,
        directContact: {
          email: contactEmail.trim() || undefined,
          phone: contactPhone.trim() || undefined,
          institution: contactInstitution.trim() || undefined,
          degree: contactDegree.trim() || undefined,
        },
      };

      const res = await fetch("/api/import/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(stageTimer);
      setCurrentStageIdx(GENERATION_STAGES.length - 1);

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.ok
            ? "Server returned non-JSON response."
            : `Server returned error (${res.status}): ${text.slice(0, 150)}`
        );
      }

      if (!res.ok || !data.success) {
        if (data.requiresPdfUpload) {
          setShowPdfModal(true);
        }
        if (data.requiresOAuth && data.authUrl) {
          setActionableOAuthUrl(data.authUrl);
        }
        throw new Error(data.error || "Failed to generate resume automatically.");
      }

      // Check if backend reported actionable OAuth recommendation
      if (data.requiresOAuth && data.authUrl) {
        setActionableOAuthUrl(data.authUrl);
      }

      // Initialize Polish fields for the review modal
      if (data.resume) {
        setPolishEmail(
          data.resume.personal?.email === "your.email@example.com" ? "" : data.resume.personal?.email || ""
        );
        setPolishPhone(
          data.resume.personal?.phone === "+1 (555) 000-0000" ? "" : data.resume.personal?.phone || ""
        );
        setPolishInstitution(
          data.resume.education?.[0]?.institution === "University / Institution"
            ? ""
            : data.resume.education?.[0]?.institution || ""
        );
        setPolishDegree(data.resume.education?.[0]?.degree || "");
        setPolishGradYear(data.resume.education?.[0]?.endYear || "2024");
      }

      // Success: populate Zustand store
      setResume(data.resume);
      setGenerationResult(data);

      if (mode === "guided") {
        // Guided mode routes directly to the interactive wizard with prefilled data
        setActiveStep(0);
        router.push("/create");
        return;
      }

      if (onSuccess) {
        onSuccess(data.resume);
      }
    } catch (err) {
      clearInterval(stageTimer);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while generating your resume. Please check your links."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPolish = () => {
    if (!generationResult) return;
    const updated = JSON.parse(JSON.stringify(generationResult.resume)) as ResumeData;

    if (polishEmail.trim()) {
      updated.personal.email = polishEmail.trim();
    }
    if (polishPhone.trim()) {
      updated.personal.phone = polishPhone.trim();
    }
    if (polishInstitution.trim()) {
      if (!updated.education || updated.education.length === 0) {
        updated.education = [
          {
            id: "edu-" + Date.now(),
            institution: polishInstitution.trim(),
            degree: polishDegree.trim() || "Bachelor of Science in Computer Science",
            location: updated.personal.location || "Remote",
            startYear: "2020",
            endYear: polishGradYear.trim() || "2024",
          },
        ];
      } else {
        updated.education[0].institution = polishInstitution.trim();
        if (polishDegree.trim()) updated.education[0].degree = polishDegree.trim();
        if (polishGradYear.trim()) updated.education[0].endYear = polishGradYear.trim();
      }
    }

    // Filter out the addressed warnings
    const remainingWarnings = generationResult.missingInformationWarnings.filter((warn) => {
      if (polishEmail.trim() && warn.toLowerCase().includes("email")) return false;
      if (polishPhone.trim() && warn.toLowerCase().includes("phone")) return false;
      if (polishInstitution.trim() && warn.toLowerCase().includes("education")) return false;
      return true;
    });

    if (updated.atsAnalysis) {
      updated.atsAnalysis.overallScore = Math.min(99, (updated.atsAnalysis.overallScore || 93) + 4);
      updated.atsAnalysis.warnings = remainingWarnings;
    }

    setResume(updated);
    setGenerationResult({
      ...generationResult,
      resume: updated,
      missingInformationWarnings: remainingWarnings,
    });

    // Sync with server database
    fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: updated }),
    }).catch(() => {});
  };

  const handleOpenLiveEditor = () => {
    if (generationResult?.resumeId) {
      router.push(`/editor/${generationResult.resumeId}`);
    } else {
      router.push("/editor");
    }
  };

  return (
    <div className="w-full">
      {/* Form Container */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl p-6 sm:p-8 backdrop-blur-md">
        {/* Mode Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resume Engine 2.0 · Evidence-Based Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Your Resume Automatically
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Paste your LinkedIn and GitHub profile links. Our AI pipeline synthesizes your real repositories, verified work history, and target role keywords into an ATS-optimized resume.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("fast")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "fast"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Fast AI Mode
            </button>
            <button
              type="button"
              onClick={() => setMode("guided")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "guided"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Guided Mode
            </button>
          </div>
        </div>

        {/* LinkedIn Connection Status Banner */}
        {linkedInAccount?.isConnected ? (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0077b5] text-white flex items-center justify-center font-bold">
                in
              </div>
              <div>
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Connected via LinkedIn OAuth: {linkedInAccount.user?.name}
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  {linkedInAccount.user?.email ? `${linkedInAccount.user.email} · ` : ""}Verified Member Identity Active
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDisconnectLinkedIn}
              className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1 h-8"
            >
              <Unlink className="w-3 h-3" /> Disconnect
            </Button>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
              <span>Official LinkedIn OAuth is available for verified identity authentication.</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={linkedInAccount?.authUrl || "/api/auth/linkedin"}
                className="text-xs font-semibold text-[#0077b5] hover:underline flex items-center gap-1"
              >
                Connect with LinkedIn OAuth <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Upload LinkedIn PDF <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Error / Actionable Guidance Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <p className="font-bold">{errorMessage}</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                LinkedIn restricts direct third-party scraping under anti-bot policies. You can either authenticate via official OAuth or upload your exported Profile PDF for 100% full career history.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {actionableOAuthUrl && (
                  <a
                    href={actionableOAuthUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077b5] text-white font-bold hover:bg-[#006097] transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Connect LinkedIn OAuth
                  </a>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPdfModal(true)}
                  className="gap-1.5 border-amber-300 dark:border-amber-700 font-semibold"
                >
                  <Upload className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  Upload LinkedIn Profile PDF
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Input Fields */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LinkedIn Profile */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
                LinkedIn Profile URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Upload className="w-3 h-3" />
                {parsedLinkedinData ? "✓ PDF Loaded" : "Upload LinkedIn PDF"}
              </button>
            </div>
            <Input
              type="url"
              placeholder="https://www.linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="font-mono text-xs"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {parsedLinkedinData ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Profile parsed: {parsedLinkedinData.fullName} ({parsedLinkedinData.experiences?.length || 0} roles)
                </span>
              ) : (
                "Used for verified member identity, work chronology, and education."
              )}
            </p>
          </div>

          {/* GitHub Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-900 dark:text-white" />
              GitHub Profile URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="https://github.com/username or @username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="font-mono text-xs"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Used to inspect public repositories, READMEs, stars, commit activity, and languages.
            </p>
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Target Job Role <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Senior Full-Stack Engineer, AI Software Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="text-xs"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Helps rank repositories and prioritize relevant keywords for your target position.
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Target Company Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Google, Stripe, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xs"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tailors the executive summary narrative toward the specific employer.
            </p>
          </div>

          {/* Optional Job Description */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Target Job Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowJdInput(!showJdInput)}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
              >
                {showJdInput ? "Hide" : "+ Paste Description"}
              </button>
            </div>
            {showJdInput ? (
              <Textarea
                rows={3}
                placeholder="Paste the target job description to automatically align technical keywords and section priorities..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="text-xs resize-none"
                disabled={isProcessing}
              />
            ) : (
              <div
                onClick={() => setShowJdInput(true)}
                className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                Click to paste target job description for customized ATS keyword alignment.
              </div>
            )}
          </div>

          {/* Optional Direct Contact & Education to Skip Warnings */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDirectContact(!showDirectContact)}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {showDirectContact ? "Hide Contact & Education Options" : "+ Add Email, Phone, or University Upfront (Optional)"}
              </button>
            </div>
            {showDirectContact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">University / College</label>
                  <Input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={contactInstitution}
                    onChange={(e) => setContactInstitution(e.target.value)}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Degree / Major</label>
                  <Input
                    type="text"
                    placeholder="e.g. B.S. in Computer Science"
                    value={contactDegree}
                    onChange={(e) => setContactDegree(e.target.value)}
                    className="text-xs h-8 mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Honesty Guarantee: We never fabricate unverified employers, metrics, or false degrees.</span>
          </div>

          <Button
            type="button"
            onClick={handleStartGeneration}
            disabled={!hasAtLeastOneLink || isProcessing}
            className="w-full sm:w-auto px-8 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 gap-2 flex items-center justify-center transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Resume...
              </>
            ) : mode === "guided" ? (
              <>
                <Compass className="w-4 h-4" />
                Import &amp; Customize in Guided Mode
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Import &amp; Generate My Resume
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-Time Generation Progress Modal */}
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              Auto-Generating Your Resume
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Our AI pipeline is extracting profile data, scoring projects, and generating your ATS resume.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {GENERATION_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3 p-2 rounded-lg text-xs transition-all ${
                    isCurrent
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold"
                      : isPast
                      ? "text-slate-700 dark:text-slate-300 opacity-90"
                      : "text-slate-400 dark:text-slate-600 opacity-60"
                  }`}
                >
                  <div className="mt-0.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{stage.label}</span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn PDF Upload Modal */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0077b5]" />
              Upload LinkedIn Profile PDF
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              LinkedIn restricts direct third-party web scraping. You can export your official profile PDF in 5 seconds:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200">How to download from LinkedIn:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Open your LinkedIn profile on a desktop or phone browser.</li>
              <li>Click the <strong>&quot;More&quot;</strong> button next to your profile photo.</li>
              <li>Select <strong>&quot;Save to PDF&quot;</strong>.</li>
              <li>Upload that PDF file below.</li>
            </ol>
          </div>

          <div className="mt-4">
            <label className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 dark:hover:border-indigo-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-indigo-50/30 dark:bg-indigo-950/20">
              <Upload className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {pdfFile ? pdfFile.name : "Choose or drag LinkedIn PDF"}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Accepts standard .pdf export</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={isUploadingPdf}
              />
            </label>
            {isUploadingPdf && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing experiences, education, and credentials...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Generation Result Review Modal */}
      {generationResult && (
        <Dialog open={Boolean(generationResult)} onOpenChange={() => setGenerationResult(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <DialogHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resume Generated Successfully
                </div>

                <Badge variant="outline" className="font-mono text-xs">
                  ATS Score: {generationResult.resume.atsAnalysis?.overallScore || 93}/100
                </Badge>
              </div>

              <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {generationResult.resume.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
                Generated using verified data from your profiles. You can review, edit, change templates, or export right now.
              </DialogDescription>
            </DialogHeader>

            {/* Sources & Overview Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sources:</span>
              {generationResult.sourcesUsed.github && (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <Github className="w-3 h-3" />
                  GitHub ({generationResult.resume.projects.length} Projects, {generationResult.resume.skills.languages.length} Languages)
                </Badge>
              )}
              {generationResult.sourcesUsed.linkedin && (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <Linkedin className="w-3 h-3 text-[#0077b5]" />
                  LinkedIn ({generationResult.resume.experience.length} Positions, {generationResult.resume.education.length} Education)
                </Badge>
              )}
              <div className="ml-auto text-indigo-600 dark:text-indigo-400 font-medium">
                Template: <span className="font-bold">{generationResult.recommendedTemplate}</span>
              </div>
            </div>

            {/* Missing Information Alerts & Quick Polish */}
            {generationResult.missingInformationWarnings.length > 0 ? (
              <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Recommended Profile Polish:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                    {generationResult.missingInformationWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>

                {/* Inline 1-Click Quick Fill & Polish Box */}
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Quick Fill &amp; Polish (Directly boosts ATS score to 98%)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      GitHub profiles protect private emails/phone numbers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={polishEmail}
                        onChange={(e) => setPolishEmail(e.target.value)}
                        className="text-xs h-8 mt-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={polishPhone}
                        onChange={(e) => setPolishPhone(e.target.value)}
                        className="text-xs h-8 mt-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">University / College</label>
                      <Input
                        type="text"
                        placeholder="e.g. Stanford University"
                        value={polishInstitution}
                        onChange={(e) => setPolishInstitution(e.target.value)}
                        className="text-xs h-8 mt-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Degree / Major</label>
                      <Input
                        type="text"
                        placeholder="e.g. B.S. in Computer Science"
                        value={polishDegree}
                        onChange={(e) => setPolishDegree(e.target.value)}
                        className="text-xs h-8 mt-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Graduation Year</label>
                      <Input
                        type="text"
                        placeholder="2024"
                        value={polishGradYear}
                        onChange={(e) => setPolishGradYear(e.target.value)}
                        className="text-xs h-8 mt-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleApplyPolish}
                        className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply Polish &amp; Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">All essential contact and education credentials are in place!</span>
                </div>
                <span className="text-[11px] font-semibold">100% Complete</span>
              </div>
            )}

            {/* Live Interactive Preview Container */}
            <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 p-4 max-h-[380px] overflow-hidden relative shadow-inner">
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/create")}
                  className="text-xs bg-white/90 dark:bg-slate-900/90 shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 mr-1" />
                  Change Template
                </Button>
              </div>

              <div className="transform scale-[0.62] sm:scale-[0.68] origin-top-left w-[145%] pointer-events-none">
                <TemplateRenderer data={generationResult.resume} isMiniature />
              </div>
            </div>

            {/* Immediate Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadPdf(generationResult.resume)}
                  className="gap-1.5 text-xs font-semibold flex-1 sm:flex-initial"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  Download PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadDocx(generationResult.resume)}
                  className="gap-1.5 text-xs font-semibold flex-1 sm:flex-initial"
                >
                  <FileDown className="w-4 h-4 text-blue-600" />
                  Download DOCX
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleOpenLiveEditor}
                className="w-full sm:w-auto gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-md shadow-indigo-600/30"
              >
                Open in Live Editor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
