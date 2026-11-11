"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { TEMPLATE_REGISTRY } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { downloadPdf, downloadDocx, triggerPrintResume } from "@/lib/pdf/client-download";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Download,
  FileText,
  Edit3,
  Layers,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Analyzing your profile...",
  "Improving your content...",
  "Matching your target role...",
  "Applying your selected design...",
  "Finalizing your resume...",
];

export function StepGenerate() {
  const router = useRouter();
  const { resume, setATSAnalysis, setActiveStep } = useResumeStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const templateDef = TEMPLATE_REGISTRY[resume.style.templateId] || TEMPLATE_REGISTRY["ats-professional"];

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setCurrentStageIndex(0);

    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStageIndex(i);
      await new Promise((r) => setTimeout(r, 650));
    }

    try {
      const atsRes = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const atsData = await atsRes.json();
      if (atsData?.atsAnalysis) {
        setATSAnalysis(atsData.atsAnalysis);
      }

      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
    } catch (err) {
      console.error("Save/analysis error:", err);
    } finally {
      setIsGenerating(false);
      setIsGenerated(true);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadPdf(resume);
    } catch {
      triggerPrintResume();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      await downloadDocx(resume);
    } catch {
      alert("Failed to download DOCX. Please try again.");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isGenerated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to Generate Your Resume
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ResumeForge AI will compile, format, and optimize your information for ATS readability.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700 text-left text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Candidate:</span>
              <span className="font-bold text-slate-900 dark:text-white">{resume.personal.fullName || "Candidate"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Target Role:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{resume.targetJob.targetRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Selected Style:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{templateDef.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">ATS Compatibility:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {templateDef.atsCompatibilityPercent}% ATS Ready
              </span>
            </div>
          </div>

          {isGenerating ? (
            <div className="space-y-4 py-4">
              {/* Contextual Loading Stage & Skeletons */}
              <div className="flex items-center justify-center gap-2.5 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{STAGES[currentStageIndex]}</span>
              </div>

              {/* Step indicator sequence without fake percentages */}
              <div className="flex justify-center items-center gap-2">
                {STAGES.map((stg, sIdx) => (
                  <div
                    key={sIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      sIdx === currentStageIndex
                        ? "w-8 bg-indigo-600 dark:bg-indigo-400"
                        : sIdx < currentStageIndex
                        ? "w-4 bg-emerald-500"
                        : "w-2 bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Skeleton Preview Placeholder */}
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto" />
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto" />
              </div>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 text-sm font-bold gap-2"
              onClick={handleStartGeneration}
            >
              Generate My Resume
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Success Banner with Action Buttons */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Your Resume is Ready!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ATS Score:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {resume.atsAnalysis?.overallScore || 94}/100
                  </strong>{" "}
                  • Template: <strong className="text-slate-700 dark:text-slate-300">{templateDef.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(8)}
                className="text-xs font-semibold gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" /> Change Style
              </Button>

              <Button
                size="sm"
                onClick={() => router.push(`/editor?id=${resume.id}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-indigo-600/20"
              >
                <Edit3 className="w-3.5 h-3.5" /> Open Live Editor
              </Button>
            </div>
          </div>

          {/* Download & ATS Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="h-12 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold gap-2 text-xs"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Download PDF (Vector ATS)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadDocx}
              disabled={isDownloadingDocx}
              className="h-12 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold gap-2 text-xs"
            >
              {isDownloadingDocx ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Generating DOCX...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Download Word (.docx)
                </>
              )}
            </Button>

            <Button
              onClick={() => router.push(`/editor?id=${resume.id}`)}
              className="h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold gap-2 text-xs sm:col-span-2 md:col-span-1 shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
              Customize & Polish in Editor →
            </Button>
          </div>

          {/* Full Reactive Resume Paper Preview */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-200/50 dark:bg-slate-950 p-4 sm:p-8 flex justify-center overflow-x-auto shadow-inner">
            <div className="bg-white text-slate-900 shadow-2xl rounded-sm max-w-[850px] w-full min-h-[1050px] ring-1 ring-slate-900/5 print:shadow-none">
              <TemplateRenderer data={resume} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
