"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles, Loader2, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

const ROLE_PRESETS = [
  "Software Developer",
  "Software Developer Intern",
  "AI / ML Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Engineer",
  "Data Analyst",
  "Android Developer",
  "Product Manager",
  "UI / UX Designer",
];

const EXPERIENCE_LEVELS: ("Student" | "Fresher" | "0-2 years" | "3-5 years" | "5+ years")[] = [
  "Student",
  "Fresher",
  "0-2 years",
  "3-5 years",
  "5+ years",
];

export function StepTargetJob() {
  const { resume, updateTargetJob, setJobAnalysis } = useResumeStore();
  const { targetJob, skills } = resume;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleAnalyzeJob = async () => {
    if (!targetJob.jobDescription || targetJob.jobDescription.trim().length < 20) {
      alert("Please paste a meaningful job description first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisDone(false);

    try {
      const allSkills = [
        ...(skills.languages || []),
        ...(skills.frameworks || []),
        ...(skills.databases || []),
        ...(skills.tools || []),
        ...(skills.cloud || []),
        ...(skills.aiml || []),
      ];

      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: targetJob.jobDescription,
          currentSkills: allSkills,
          targetRole: targetJob.targetRole,
        }),
      });

      const data = await res.json();
      if (data && data.jobMatchScore) {
        setJobAnalysis(data);
        setAnalysisDone(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Target Role & Job Description</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tell us the job you are targeting. Our AI will analyze requirements and tailor keyword matching.
        </p>
      </div>

      <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm space-y-4 transition-all duration-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            What job are you applying for? <span className="text-red-500">*</span>
          </label>
          <Input
            value={targetJob.targetRole}
            onChange={(e) => updateTargetJob({ targetRole: e.target.value })}
            placeholder="e.g. Software Developer"
          />

          {/* Role Presets */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center mr-1">Quick Select:</span>
            {ROLE_PRESETS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => updateTargetJob({ targetRole: role })}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                  targetJob.targetRole === role
                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Experience Level
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateTargetJob({ experienceLevel: lvl })}
                  className={`text-xs py-1.5 rounded-lg border text-center transition-all ${
                    targetJob.experienceLevel === lvl
                      ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Industry (Optional)
            </label>
            <Input
              value={targetJob.targetIndustry || ""}
              onChange={(e) => updateTargetJob({ targetIndustry: e.target.value })}
              placeholder="e.g. Technology / SaaS / FinTech"
            />
          </div>
        </div>

        {/* Paste Job Description */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste Job Description (Optional but Recommended)
              </label>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Paste the full job posting from LinkedIn, Indeed, or company careers page.
              </p>
            </div>
            <Button
              type="button"
              variant="subtle"
              size="sm"
              disabled={isAnalyzing || !targetJob.jobDescription}
              onClick={handleAnalyzeJob}
              className="gap-1.5 text-xs font-semibold dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Analyze Job Match
                </>
              )}
            </Button>
          </div>

          <Textarea
            rows={5}
            value={targetJob.jobDescription}
            onChange={(e) => updateTargetJob({ jobDescription: e.target.value })}
            placeholder="Paste responsibilities, requirements, and desired qualifications here..."
            className="text-xs font-mono"
          />
        </div>

        {/* Analysis Results Cards */}
        {resume.jobAnalysis && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Job Match Diagnostics
              </span>
              <Badge className="bg-indigo-600 text-white font-bold text-xs">
                {resume.jobAnalysis.jobMatchScore}% Match
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Skills Match</p>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{resume.jobAnalysis.skillsMatch}%</p>
              </div>
              <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Keyword Match</p>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{resume.jobAnalysis.keywordMatch}%</p>
              </div>
              <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Experience Match</p>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{resume.jobAnalysis.experienceMatch}%</p>
              </div>
              <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Education Match</p>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{resume.jobAnalysis.educationMatch}%</p>
              </div>
            </div>

            {resume.jobAnalysis.recommendations?.length > 0 && (
              <div className="text-xs space-y-1 pt-1 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-indigo-950 dark:text-indigo-200 text-[11px]">AI Recommendations for this Role:</p>
                {resume.jobAnalysis.recommendations.map((rec, rIdx) => (
                  <p key={rIdx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
