"use client";

import React, { useState } from "react";
import { StepCertifications } from "./StepCertifications";
import { StepAchievements } from "./StepAchievements";
import { Award, Trophy } from "lucide-react";

export function StepCredentials() {
  const [activeTab, setActiveTab] = useState<"certifications" | "achievements">("certifications");

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab("certifications")}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
            activeTab === "certifications"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          Certifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("achievements")}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
            activeTab === "achievements"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Honors & Achievements
        </button>
      </div>

      {activeTab === "certifications" ? <StepCertifications /> : <StepAchievements />}
    </div>
  );
}
