"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderGit2, Sparkles, Loader2 } from "lucide-react";

export function StepProjects() {
  const { resume, addProject, updateProject, removeProject } = useResumeStore();
  const { projects, targetJob } = resume;
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleImproveProject = async (projId: string, name: string, description: string, technologies: string[]) => {
    setLoadingAiId(projId);
    try {
      const res = await fetch("/api/ai/improve-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: name,
          rawDescription: description,
          technologies,
          targetRole: targetJob.targetRole,
        }),
      });
      const data = await res.json();
      if (data?.bullets && Array.isArray(data.bullets)) {
        updateProject(projId, { highlights: data.bullets });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiId(null);
    }
  };

  const handleAddHighlight = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    updateProject(projId, {
      highlights: [...(proj.highlights || []), "Implemented core functionality with high efficiency."],
    });
  };

  const handleUpdateHighlight = (projId: string, index: number, value: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const updated = [...proj.highlights];
    updated[index] = value;
    updateProject(projId, { highlights: updated });
  };

  const handleRemoveHighlight = (projId: string, index: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const updated = proj.highlights.filter((_, i) => i !== index);
    updateProject(projId, { highlights: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Key Technical Projects</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showcase your best software or engineering projects, capstones, and open-source contributions.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addProject()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
          <FolderGit2 className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No projects added yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Projects are crucial for technical, fresher, and student resumes.
          </p>
          <Button size="sm" onClick={() => addProject()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Project
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm space-y-4 relative transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Project #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeProject(proj.id)}
                  className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1"
                  title="Remove project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="e.g. AI Farming Platform"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technologies Used (comma separated)
                  </label>
                  <Input
                    value={proj.technologies.join(", ")}
                    onChange={(e) =>
                      updateProject(proj.id, {
                        technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Python, React, PostgreSQL, Docker"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub / Source Code URL
                  </label>
                  <Input
                    value={proj.githubUrl || ""}
                    onChange={(e) => updateProject(proj.id, { githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo URL
                  </label>
                  <Input
                    value={proj.liveUrl || ""}
                    onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })}
                    placeholder="https://my-app.vercel.app"
                  />
                </div>
              </div>

              {/* Project Description & AI Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    What does this project do?
                  </label>
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    disabled={loadingAiId === proj.id}
                    onClick={() =>
                      handleImproveProject(proj.id, proj.name, proj.description, proj.technologies)
                    }
                    className="gap-1.5 text-xs font-semibold dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60"
                  >
                    {loadingAiId === proj.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Refining Bullets...
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
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                  placeholder="e.g. Built an automated crop detection platform using AI and React..."
                  className="text-xs"
                />
              </div>

              {/* Editable highlights */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Resume Bullet Points ({proj.highlights?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddHighlight(proj.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    + Add Bullet
                  </button>
                </div>

                {proj.highlights?.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-slate-400 dark:text-slate-500 mt-2 text-xs">•</span>
                    <Input
                      value={bullet}
                      onChange={(e) => handleUpdateHighlight(proj.id, bIdx, e.target.value)}
                      className="text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(proj.id, bIdx)}
                      className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 mt-1.5 p-1"
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
