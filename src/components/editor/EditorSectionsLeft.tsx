"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  User,
  FileText,
  Briefcase,
  FolderGit2,
  Cpu,
  GraduationCap,
  Award,
  Trophy,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import { SkillCategories } from "@/types/resume";

const DEFAULT_SECTIONS = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
  "achievements",
];

export function EditorSectionsLeft() {
  const {
    resume,
    updatePersonal,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addEducation,
    updateEducation,
    removeEducation,
    addCertification,
    updateCertification,
    removeCertification,
    addAchievement,
    updateAchievement,
    removeAchievement,
    removeSkillFromCategory,
    addSkillToCategory,
    updateStyle,
  } = useResumeStore();

  const [openSection, setOpenSection] = useState<string>("summary");
  const [loadingAiKey, setLoadingAiKey] = useState<string | null>(null);
  const [newSkillText, setNewSkillText] = useState("");

  const sectionOrder = resume.style?.sectionOrder?.length
    ? resume.style.sectionOrder
    : DEFAULT_SECTIONS;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const newOrder = [...sectionOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateStyle({ sectionOrder: newOrder });
  };

  const handleImproveSummary = async () => {
    setLoadingAiKey("summary");
    try {
      const res = await fetch("/api/ai/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: resume.personal.fullName,
          targetRole: resume.targetJob.targetRole,
          currentSummary: resume.summary,
          skills: resume.skills.languages.concat(resume.skills.frameworks),
        }),
      });
      const data = await res.json();
      if (data?.summary) {
        updateSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiKey(null);
    }
  };

  const handleImproveExpBullets = async (expId: string, desc: string, role: string, company: string) => {
    setLoadingAiKey(`exp-${expId}`);
    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          company,
          rawText: desc,
          technologies: resume.skills.languages,
          targetRole: resume.targetJob.targetRole,
        }),
      });
      const data = await res.json();
      if (data?.bullets) {
        updateExperience(expId, { highlights: data.bullets });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiKey(null);
    }
  };

  const handleImproveProjBullets = async (projId: string, name: string, desc: string, techs: string[]) => {
    setLoadingAiKey(`proj-${projId}`);
    try {
      const res = await fetch("/api/ai/improve-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: name,
          rawDescription: desc,
          technologies: techs,
          targetRole: resume.targetJob.targetRole,
        }),
      });
      const data = await res.json();
      if (data?.bullets) {
        updateProject(projId, { highlights: data.bullets });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiKey(null);
    }
  };

  // Section renderers map
  const renderSectionBlock = (sectionKey: string, index: number) => {
    const isFirst = index === 0;
    const isLast = index === sectionOrder.length - 1;

    switch (sectionKey) {
      case "summary":
        return (
          <div key="summary" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("summary")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Professional Summary</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("summary")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "summary" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "summary" && (
              <div className="p-3 space-y-2 bg-white dark:bg-slate-950">
                <div className="flex justify-end">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={handleImproveSummary}
                    disabled={loadingAiKey === "summary"}
                    className="h-7 text-[11px] gap-1 font-semibold"
                  >
                    {loadingAiKey === "summary" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    )}
                    Improve with AI
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  value={resume.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="text-xs leading-relaxed"
                  placeholder="Enter a concise, high-impact career summary..."
                />
              </div>
            )}
          </div>
        );

      case "experience":
        return (
          <div key="experience" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("experience")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Experience ({resume.experience.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("experience")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "experience" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "experience" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Positions</span>
                  <button
                    type="button"
                    onClick={() => addExperience()}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Position
                  </button>
                </div>

                {resume.experience.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No experience added"
                    description="Include full-time roles, internships, or freelance projects."
                    actionLabel="+ Add Position"
                    onAction={() => addExperience()}
                  />
                ) : (
                  resume.experience.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <Input
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                          className="text-xs h-7 font-bold bg-white dark:bg-slate-900"
                          placeholder="Role / Title"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-slate-400 hover:text-red-600 p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        className="text-xs h-7 bg-white dark:bg-slate-900"
                        placeholder="Company"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="Start Date"
                        />
                        <Input
                          value={exp.isCurrent ? "Present" : exp.endDate}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="End Date"
                        />
                      </div>

                      {/* Bullets & AI button */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-500">Key Highlights ({exp.highlights.length})</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleImproveExpBullets(exp.id, exp.description || exp.highlights.join(" "), exp.role, exp.company)
                            }
                            disabled={loadingAiKey === `exp-${exp.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            {loadingAiKey === `exp-${exp.id}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            AI Polish
                          </button>
                        </div>
                        {exp.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1">
                            <span className="text-slate-400">•</span>
                            <Input
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...exp.highlights];
                                updated[bIdx] = e.target.value;
                                updateExperience(exp.id, { highlights: updated });
                              }}
                              className="text-xs h-7 flex-1 bg-white dark:bg-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = exp.highlights.filter((_, idx) => idx !== bIdx);
                                updateExperience(exp.id, { highlights: updated });
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case "projects":
        return (
          <div key="projects" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("projects")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Technical Projects ({resume.projects.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("projects")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "projects" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "projects" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Projects</span>
                  <button
                    type="button"
                    onClick={() => addProject()}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>

                {resume.projects.length === 0 ? (
                  <EmptyState
                    icon={FolderGit2}
                    title="No projects added"
                    description="Highlight technical applications, capstone projects, or open-source repositories."
                    actionLabel="+ Add Project"
                    onAction={() => addProject()}
                  />
                ) : (
                  resume.projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <Input
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                          className="text-xs h-7 font-bold bg-white dark:bg-slate-900"
                          placeholder="Project Name"
                        />
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="text-slate-400 hover:text-red-600 p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Input
                        value={proj.technologies.join(", ")}
                        onChange={(e) =>
                          updateProject(proj.id, {
                            technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                          })
                        }
                        className="text-xs h-7 bg-white dark:bg-slate-900"
                        placeholder="Technologies (comma separated)"
                      />

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-500">Bullets ({proj.highlights.length})</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleImproveProjBullets(proj.id, proj.name, proj.description, proj.technologies)
                            }
                            disabled={loadingAiKey === `proj-${proj.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            {loadingAiKey === `proj-${proj.id}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            AI Bullets
                          </button>
                        </div>
                        {proj.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1">
                            <span className="text-slate-400">•</span>
                            <Input
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...proj.highlights];
                                updated[bIdx] = e.target.value;
                                updateProject(proj.id, { highlights: updated });
                              }}
                              className="text-xs h-7 flex-1 bg-white dark:bg-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = proj.highlights.filter((_, idx) => idx !== bIdx);
                                updateProject(proj.id, { highlights: updated });
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case "skills":
        return (
          <div key="skills" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("skills")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Skills & Competencies</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("skills")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "skills" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "skills" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                {(["languages", "frameworks", "databases", "tools", "cloud", "aiml"] as (keyof SkillCategories)[]).map((catKey) => (
                  <div key={catKey}>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 capitalize">{catKey}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(resume.skills[catKey] || []).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillFromCategory(catKey, skill)}
                            className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "education":
        return (
          <div key="education" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("education")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Education ({resume.education.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("education")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "education" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "education" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Degrees</span>
                  <button
                    type="button"
                    onClick={() => addEducation()}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Degree
                  </button>
                </div>

                {resume.education.length === 0 ? (
                  <EmptyState
                    icon={GraduationCap}
                    title="No education added"
                    description="Add your university degree, major, CGPA, and coursework."
                    actionLabel="+ Add Degree"
                    onAction={() => addEducation()}
                  />
                ) : (
                  resume.education.map((edu) => (
                    <div key={edu.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                          className="text-xs h-7 font-bold bg-white dark:bg-slate-900"
                          placeholder="Institution"
                        />
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-slate-400 hover:text-red-600 p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                        className="text-xs h-7 bg-white dark:bg-slate-900"
                        placeholder="Degree"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={edu.startYear}
                          onChange={(e) => updateEducation(edu.id, { startYear: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="Start Year"
                        />
                        <Input
                          value={edu.endYear}
                          onChange={(e) => updateEducation(edu.id, { endYear: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="End Year"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case "certifications":
        return (
          <div key="certifications" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("certifications")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Certifications ({resume.certifications.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("certifications")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "certifications" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "certifications" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Credentials</span>
                  <button
                    type="button"
                    onClick={() => addCertification()}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Certificate
                  </button>
                </div>

                {resume.certifications.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No certifications added"
                    description="Add industry certifications from AWS, Microsoft, Google, or Coursera."
                    actionLabel="+ Add Certificate"
                    onAction={() => addCertification()}
                  />
                ) : (
                  resume.certifications.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <Input
                          value={c.name}
                          onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                          className="text-xs h-7 font-bold bg-white dark:bg-slate-900"
                          placeholder="Certificate Name"
                        />
                        <button
                          type="button"
                          onClick={() => removeCertification(c.id)}
                          className="text-slate-400 hover:text-red-600 p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={c.issuer}
                          onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="Issuer (e.g. AWS)"
                        />
                        <Input
                          value={c.issueDate}
                          onChange={(e) => updateCertification(c.id, { issueDate: e.target.value })}
                          className="text-xs h-7 bg-white dark:bg-slate-900"
                          placeholder="Issue Year"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case "achievements":
        return (
          <div key="achievements" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
            <div className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 font-semibold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("achievements")}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <Trophy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Honors & Achievements ({resume.achievements.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => handleMoveSection(index, "up")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => handleMoveSection(index, "down")}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("achievements")}
                  className="p-1 text-slate-400"
                >
                  {openSection === "achievements" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {openSection === "achievements" && (
              <div className="p-3 space-y-3 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Awards</span>
                  <button
                    type="button"
                    onClick={() => addAchievement()}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Achievement
                  </button>
                </div>

                {resume.achievements.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="No achievements added"
                    description="Highlight hackathon wins, scholarship awards, or competitive programming."
                    actionLabel="+ Add Achievement"
                    onAction={() => addAchievement()}
                  />
                ) : (
                  resume.achievements.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <Input
                          value={a.title}
                          onChange={(e) => updateAchievement(a.id, { title: e.target.value })}
                          className="text-xs h-7 font-bold bg-white dark:bg-slate-900"
                          placeholder="Award / Contest Title"
                        />
                        <button
                          type="button"
                          onClick={() => removeAchievement(a.id)}
                          className="text-slate-400 hover:text-red-600 p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Input
                        value={a.organization || ""}
                        onChange={(e) => updateAchievement(a.id, { organization: e.target.value })}
                        className="text-xs h-7 bg-white dark:bg-slate-900"
                        placeholder="Organization / Event"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-950 border-r border-slate-200/90 dark:border-slate-800 editor-sidebar text-xs transition-colors duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Content Sections
        </span>
        <span className="text-[10px] text-slate-400">Reorder with ↑ / ↓</span>
      </div>

      {/* Always Top: Personal Section */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggleSection("personal")}
          className="w-full flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Personal Info
          </span>
          {openSection === "personal" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {openSection === "personal" && (
          <div className="p-3 space-y-2.5 bg-white dark:bg-slate-950">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
              <Input
                value={resume.personal.fullName}
                onChange={(e) => updatePersonal({ fullName: e.target.value })}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Professional Headline</label>
              <Input
                value={resume.personal.headline}
                onChange={(e) => updatePersonal({ headline: e.target.value })}
                className="text-xs h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Email</label>
                <Input
                  value={resume.personal.email}
                  onChange={(e) => updatePersonal({ email: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Phone</label>
                <Input
                  value={resume.personal.phone}
                  onChange={(e) => updatePersonal({ phone: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Location</label>
              <Input
                value={resume.personal.location}
                onChange={(e) => updatePersonal({ location: e.target.value })}
                className="text-xs h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">LinkedIn URL</label>
                <Input
                  value={resume.personal.linkedin || ""}
                  onChange={(e) => updatePersonal({ linkedin: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">GitHub URL</label>
                <Input
                  value={resume.personal.github || ""}
                  onChange={(e) => updatePersonal({ github: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Reorderable Sections */}
      {sectionOrder.map((secKey, idx) => renderSectionBlock(secKey, idx))}
    </div>
  );
}
