"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Trophy } from "lucide-react";

export function StepAchievements() {
  const { resume, addAchievement, updateAchievement, removeAchievement } = useResumeStore();
  const { achievements } = resume;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Honors, Awards & Achievements</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Include hackathon wins, competitive programming rankings, or student club leadership.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAchievement()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </Button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
          <Trophy className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No achievements added</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">You can add your competitions, contests, or continue to next step.</p>
          <Button size="sm" onClick={() => addAchievement()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Achievement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((a, idx) => (
            <div
              key={a.id}
              className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm space-y-3 relative transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Achievement #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAchievement(a.id)}
                  className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Achievement Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={a.title}
                    onChange={(e) => updateAchievement(a.id, { title: e.target.value })}
                    placeholder="e.g. 1st Place Winner — University Annual Hackathon 2024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organization / Event Name
                  </label>
                  <Input
                    value={a.organization || ""}
                    onChange={(e) => updateAchievement(a.id, { organization: e.target.value })}
                    placeholder="e.g. Galgotias University Tech Fest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date / Year
                  </label>
                  <Input
                    value={a.date || ""}
                    onChange={(e) => updateAchievement(a.id, { date: e.target.value })}
                    placeholder="e.g. March 2024"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Impact
                  </label>
                  <Input
                    value={a.description}
                    onChange={(e) => updateAchievement(a.id, { description: e.target.value })}
                    placeholder="e.g. Built an emergency response telemedicine portal within 36 hours among 80+ teams."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
