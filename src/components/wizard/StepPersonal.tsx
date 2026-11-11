"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check } from "lucide-react";

export function StepPersonal() {
  const { resume, updatePersonal, updateSummary } = useResumeStore();
  const { personal, summary, targetJob } = resume;
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [summaryImprovedSuccess, setSummaryImprovedSuccess] = useState(false);

  const handleAiImproveSummary = async () => {
    setIsImprovingSummary(true);
    setSummaryImprovedSuccess(false);
    try {
      const res = await fetch("/api/ai/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: personal.fullName,
          targetRole: targetJob.targetRole,
          experienceLevel: targetJob.experienceLevel,
          currentSummary: summary,
          skills: resume.skills.languages.concat(resume.skills.frameworks),
          jobDescription: targetJob.jobDescription,
        }),
      });
      const data = await res.json();
      if (data?.summary) {
        updateSummary(data.summary);
        setSummaryImprovedSuccess(true);
        setTimeout(() => setSummaryImprovedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImprovingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal & Contact Information</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your accurate contact details. Recruiters and ATS scanners parse these first.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={personal.fullName}
            onChange={(e) => updatePersonal({ fullName: e.target.value })}
            placeholder="e.g. Devesh Sharma"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Professional Headline
          </label>
          <Input
            value={personal.headline}
            onChange={(e) => updatePersonal({ headline: e.target.value })}
            placeholder="e.g. B.Tech CSE (AI/ML) Student & Full-Stack Developer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="devesh.sharma@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <Input
            value={personal.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Location (City, Country)
          </label>
          <Input
            value={personal.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="Greater Noida, India"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            LinkedIn Profile URL
          </label>
          <Input
            value={personal.linkedin || ""}
            onChange={(e) => updatePersonal({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/devesh-sharma"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            GitHub Profile URL
          </label>
          <Input
            value={personal.github || ""}
            onChange={(e) => updatePersonal({ github: e.target.value })}
            placeholder="https://github.com/devesh-sharma"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Portfolio / Personal Website
          </label>
          <Input
            value={personal.portfolio || ""}
            onChange={(e) => updatePersonal({ portfolio: e.target.value })}
            placeholder="https://deveshsharma.dev"
          />
        </div>
      </div>

      {/* Professional Summary with AI Enhancement */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Professional Summary
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Briefly describe your background or let AI convert your raw thoughts into recruiter-ready copy.
            </p>
          </div>
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={handleAiImproveSummary}
            disabled={isImprovingSummary}
            className="gap-1.5 text-xs font-semibold"
          >
            {isImprovingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Refining Summary...
              </>
            ) : summaryImprovedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Improved with AI
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Improve with AI
              </>
            )}
          </Button>
        </div>

        <Textarea
          rows={4}
          value={summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="e.g. I am a Computer Science student passionate about web development and AI. Built several full-stack projects..."
          className="text-xs leading-relaxed"
        />
      </div>
    </div>
  );
}
