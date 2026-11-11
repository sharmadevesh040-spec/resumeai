"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Briefcase, Sparkles, Loader2 } from "lucide-react";

export function StepExperience() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const { experience, targetJob } = resume;
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleImproveBullets = async (expId: string, rawText: string, role: string, company: string) => {
    setLoadingAiId(expId);
    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          company,
          rawText,
          technologies: resume.skills.languages.concat(resume.skills.frameworks),
          targetRole: targetJob.targetRole,
        }),
      });
      const data = await res.json();
      if (data?.bullets && Array.isArray(data.bullets)) {
        updateExperience(expId, { highlights: data.bullets });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiId(null);
    }
  };

  const handleAddHighlight = (expId: string) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      highlights: [...(exp.highlights || []), "Contributed to engineering objectives."],
    });
  };

  const handleUpdateHighlight = (expId: string, index: number, value: string) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;
    const updated = [...exp.highlights];
    updated[index] = value;
    updateExperience(expId, { highlights: updated });
  };

  const handleRemoveHighlight = (expId: string, index: number) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;
    const updated = exp.highlights.filter((_, i) => i !== index);
    updateExperience(expId, { highlights: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Work & Internship Experience</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add full-time roles, internships, or freelance work. Students can skip or add club leadership.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addExperience()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No work experience added yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            If you are a student or fresher, you can continue without adding work experience.
          </p>
          <Button size="sm" onClick={() => addExperience()} className="bg-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, idx) => (
            <div
              key={exp.id}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Position #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Remove position"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Role <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                    placeholder="e.g. Software Engineering Intern"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    placeholder="e.g. Nexus Technologies"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                    placeholder="e.g. Noida, India / Remote"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      placeholder="June 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <Input
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? "Present" : exp.endDate}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      placeholder="August 2024"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.isCurrent}
                  onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  I currently work here
                </label>
              </div>

              {/* Raw Description & AI Bullet Converter */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    What did you do in this role?
                  </label>
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    disabled={loadingAiId === exp.id}
                    onClick={() =>
                      handleImproveBullets(exp.id, exp.description || exp.highlights.join(". "), exp.role, exp.company)
                    }
                    className="gap-1.5 text-xs font-semibold"
                  >
                    {loadingAiId === exp.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Bullets...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Generate AI Bullets
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                  placeholder="e.g. Worked on frontend components in React, helped team with database queries and bugs"
                  className="text-xs"
                />
              </div>

              {/* Generated / Editable Bullets List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Resume Bullet Points ({exp.highlights?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddHighlight(exp.id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                  >
                    + Add Bullet
                  </button>
                </div>

                {exp.highlights?.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-2 text-xs">•</span>
                    <Input
                      value={bullet}
                      onChange={(e) => handleUpdateHighlight(exp.id, bIdx, e.target.value)}
                      className="text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(exp.id, bIdx)}
                      className="text-slate-400 hover:text-red-500 mt-1.5 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
