"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Lightbulb } from "lucide-react";
import { SkillCategories } from "@/types/resume";

const CATEGORY_META: { key: keyof SkillCategories; label: string; placeholder: string; examples: string[] }[] = [
  {
    key: "languages",
    label: "Programming Languages",
    placeholder: "Type a language & press Enter (e.g. Python, Java, TypeScript)...",
    examples: ["Python", "Java", "TypeScript", "JavaScript", "C++", "SQL", "Go", "Rust"],
  },
  {
    key: "frameworks",
    label: "Frameworks & Libraries",
    placeholder: "Type a framework & press Enter (e.g. React, Next.js, FastAPI)...",
    examples: ["React", "Next.js", "Node.js", "FastAPI", "Express", "Tailwind CSS", "Django", "Spring Boot"],
  },
  {
    key: "databases",
    label: "Databases & Storage",
    placeholder: "Type a database & press Enter (e.g. PostgreSQL, MongoDB)...",
    examples: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase"],
  },
  {
    key: "tools",
    label: "Developer Tools & Platforms",
    placeholder: "Type a tool & press Enter (e.g. Git, Docker, Postman)...",
    examples: ["Git", "GitHub", "Docker", "Postman", "VS Code", "Linux", "Webpack", "Jira"],
  },
  {
    key: "cloud",
    label: "Cloud & DevOps",
    placeholder: "Type a cloud platform & press Enter (e.g. AWS, Vercel)...",
    examples: ["AWS (S3, EC2)", "Vercel", "GCP", "Azure", "CI/CD Actions", "Kubernetes"],
  },
  {
    key: "aiml",
    label: "AI & Machine Learning",
    placeholder: "Type an AI/ML skill & press Enter (e.g. TensorFlow, OpenCV)...",
    examples: ["TensorFlow", "PyTorch", "Scikit-Learn", "OpenCV", "Pandas", "NumPy", "NLP", "LLM APIs"],
  },
  {
    key: "softSkills",
    label: "Professional & Soft Skills",
    placeholder: "Type a soft skill & press Enter (e.g. Agile, Team Collaboration)...",
    examples: ["Agile / Scrum", "Technical Writing", "Problem Solving", "Team Leadership", "Cross-Functional Collaboration"],
  },
];

export function StepSkills() {
  const { resume, addSkillToCategory, removeSkillFromCategory } = useResumeStore();
  const { skills } = resume;
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleKeyDown = (catKey: keyof SkillCategories, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValues[catKey]?.trim();
      if (val) {
        addSkillToCategory(catKey, val);
        setInputValues({ ...inputValues, [catKey]: "" });
      }
    }
  };

  const handleAddPreset = (catKey: keyof SkillCategories, skill: string) => {
    addSkillToCategory(catKey, skill);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technical & Professional Skills</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Group your skills into clear categories. ATS parsers match these against job requirements.
        </p>
      </div>

      <div className="space-y-5">
        {CATEGORY_META.map((cat) => {
          const currentSkills = skills[cat.key] || [];

          return (
            <div key={cat.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  {cat.label} ({currentSkills.length})
                </span>
              </div>

              {/* Input for adding new skills */}
              <div className="flex gap-2">
                <Input
                  value={inputValues[cat.key] || ""}
                  onChange={(e) => setInputValues({ ...inputValues, [cat.key]: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(cat.key, e)}
                  placeholder={cat.placeholder}
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = inputValues[cat.key]?.trim();
                    if (val) {
                      addSkillToCategory(cat.key, val);
                      setInputValues({ ...inputValues, [cat.key]: "" });
                    }
                  }}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Chips container */}
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {currentSkills.length === 0 ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">No skills added in this category yet.</span>
                ) : (
                  currentSkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:dark:bg-slate-700/80 transition-colors"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillFromCategory(cat.key, skill)}
                        className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
                </span>
                {cat.examples
                  .filter((ex) => !currentSkills.includes(ex))
                  .slice(0, 5)
                  .map((ex, eIdx) => (
                    <button
                      key={eIdx}
                      type="button"
                      onClick={() => handleAddPreset(cat.key, ex)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 hover:underline bg-indigo-50/50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/60 transition-colors"
                    >
                      + {ex}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
