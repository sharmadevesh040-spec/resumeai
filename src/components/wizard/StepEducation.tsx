"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export function StepEducation() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const { education } = resume;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Education Background</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            List your universities, degrees, coursework, and academic honors.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addEducation()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Degree
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No education entries added yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click below to add your degree or college</p>
          <Button size="sm" onClick={() => addEducation()} className="bg-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Add Degree
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((edu, idx) => (
            <div
              key={edu.id}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Degree #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Remove entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Degree / Major <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science and Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    placeholder="e.g. Galgotias University"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <Input
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                    placeholder="e.g. Greater Noida, UP"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Year
                    </label>
                    <Input
                      value={edu.startYear}
                      onChange={(e) => updateEducation(edu.id, { startYear: e.target.value })}
                      placeholder="2021"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End / Expected
                    </label>
                    <Input
                      value={edu.endYear}
                      onChange={(e) => updateEducation(edu.id, { endYear: e.target.value })}
                      placeholder="2025"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CGPA / Percentage
                  </label>
                  <Input
                    value={edu.gpa || ""}
                    onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                    placeholder="e.g. 8.7 / 10.0 CGPA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Honors / Achievements
                  </label>
                  <Input
                    value={edu.achievements || ""}
                    onChange={(e) => updateEducation(edu.id, { achievements: e.target.value })}
                    placeholder="Dean's Merit List, Technical Lead"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relevant Coursework
                  </label>
                  <Input
                    value={edu.coursework || ""}
                    onChange={(e) => updateEducation(edu.id, { coursework: e.target.value })}
                    placeholder="Data Structures, Algorithms, Artificial Intelligence, Database Systems"
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
