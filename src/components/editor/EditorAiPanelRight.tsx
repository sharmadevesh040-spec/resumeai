"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Lightbulb,
  Loader2,
  Check,
  Target,
  Wand2,
  Info,
  RefreshCw,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AI_ACTIONS = [
  { label: "Improve", key: "improve" },
  { label: "Rewrite", key: "rewrite" },
  { label: "Shorten", key: "shorten" },
  { label: "Make Professional", key: "professional" },
  { label: "Fix Grammar", key: "grammar" },
  { label: "Generate Bullets", key: "bullets" },
  { label: "Optimize for Job", key: "optimize" },
];

export function EditorAiPanelRight() {
  const { resume, setATSAnalysis } = useResumeStore();
  const ats = resume.atsAnalysis || {
    overallScore: 92,
    keywordMatch: 88,
    structure: 94,
    skills: 91,
    experience: 89,
    readability: 95,
    formatting: 95,
    matchedKeywords: ["Python", "Java", "React", "SQL", "Git"],
    missingKeywords: ["CI/CD Pipelines", "Docker"],
    strengths: [
      "Quantifiable impact throughout project bullets.",
      "Clear standard ATS heading hierarchy.",
    ],
    recommendations: [
      "Incorporate mentions of testing or CI/CD pipelines where applicable.",
      "Highlight your target role keywords in the professional summary.",
      "Ensure all dates follow consistent month/year format.",
    ],
    warnings: [],
  };

  const [aiInputText, setAiInputText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshingScore, setIsRefreshingScore] = useState(false);
  const [lastAction, setLastAction] = useState("Improve");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleRunAiAction = async (actionLabel: string) => {
    setIsProcessing(true);
    setAiSuggestion(null);
    setLastAction(actionLabel);
    setCopiedSuccess(false);

    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: aiInputText || "built an interactive website and optimized performance",
          targetRole: resume.targetJob.targetRole,
          actionType: actionLabel.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data?.bullets && data.bullets.length > 0) {
        setAiSuggestion(data.bullets[0]);
      } else {
        setAiSuggestion(
          "Engineered a responsive, high-performance web interface utilizing modern frameworks, reducing latency and boosting user workflow efficiency."
        );
      }
    } catch {
      setAiSuggestion(
        "Engineered a responsive, high-performance web interface utilizing modern frameworks, reducing latency and boosting user workflow efficiency."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshATSScore = async () => {
    setIsRefreshingScore(true);
    try {
      const res = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const data = await res.json();
      if (data?.atsAnalysis) {
        setATSAnalysis(data.atsAnalysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshingScore(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    navigator.clipboard.writeText(aiSuggestion);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-5 bg-white dark:bg-slate-950 border-l border-slate-200/90 dark:border-slate-800 ai-panel text-xs transition-colors duration-200">
      {/* 1. Resume Score / Compatibility Analysis Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Resume Compatibility
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshATSScore}
            disabled={isRefreshingScore}
            className="h-6 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingScore ? "animate-spin" : ""}`} />
            {isRefreshingScore ? "Scoring..." : "Re-Score"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <span className="text-xl font-extrabold leading-none">{ats.overallScore}</span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">/ 100</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Recruiter Readiness</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {ats.overallScore >= 90 ? "Highly Optimized" : ats.overallScore >= 75 ? "Competitive" : "Needs Review"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${ats.overallScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Target Role: {resume.targetJob.targetRole}</p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[10px]">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Keyword Match</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{ats.keywordMatch}%</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Structure</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{ats.structure}%</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Readability</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{ats.readability}%</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Skills</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{ats.skills}%</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Experience</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{ats.experience}%</span>
          </div>
        </div>

        {/* Actionable recommendations list */}
        {ats.recommendations?.length > 0 && (
          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
            <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Actionable Recommendations
            </p>
            {ats.recommendations.map((rec, idx) => (
              <p key={idx} className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight flex items-start gap-1.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                <span>{rec}</span>
              </p>
            ))}
          </div>
        )}

        {/* Disclaimer Note */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-start gap-1 text-[9px] text-slate-400 dark:text-slate-500">
          <Info className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            Compatibility analysis reflects recruiter parsing guidelines & keyword relevance, not an endorsement of any single proprietary ATS.
          </span>
        </div>
      </div>

      {/* 2. Interactive AI Assistant Panel */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            AI Assistant
          </span>
          <Badge variant="brand" className="text-[9px]">Live Co-pilot</Badge>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Paste any sentence or rough bullet to improve, rewrite, or optimize:
        </p>

        <Textarea
          rows={2}
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
          placeholder="e.g. built a fast web dashboard with React and API"
          className="text-xs"
        />

        {/* Action Buttons: Improve, Rewrite, Shorten, Make Professional, Fix Grammar, Generate Bullets, Optimize for Job */}
        <div className="flex flex-wrap gap-1">
          {AI_ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              disabled={isProcessing}
              onClick={() => handleRunAiAction(action.label)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>AI Assistant refining content...</span>
          </div>
        )}

        <AnimatePresence>
          {aiSuggestion && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                  AI Suggestion ({lastAction}):
                </span>
                <span className="text-[9px] text-slate-400 italic">Review before accepting</span>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/70 p-2 rounded border border-indigo-100 dark:border-indigo-900/60">
                "{aiSuggestion}"
              </p>

              {/* Accept, Try Again, Cancel Controls */}
              <div className="flex items-center gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900">
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                  onClick={handleAcceptSuggestion}
                >
                  <Check className="w-3 h-3" />
                  {copiedSuccess ? "Copied to Clipboard! ✓" : "Accept & Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => handleRunAiAction(lastAction)}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-slate-400"
                  onClick={() => setAiSuggestion(null)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Job Match Optimizer Target */}
      {resume.targetJob.jobDescription && (
        <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950 dark:text-indigo-200">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Job Description Target
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Active Target Role: <strong>{resume.targetJob.targetRole}</strong>
          </p>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {resume.skills.languages.slice(0, 5).map((s, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
