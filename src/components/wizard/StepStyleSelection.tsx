"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { TEMPLATE_LIST, TEMPLATE_REGISTRY, TemplateDefinition } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { TemplateId } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Sparkles,
  Check,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Palette,
  Type,
  Layout,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Image as ImageIcon,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

const ACCENT_COLORS = [
  { name: "Navy Corporate", value: "#1e3a8a" },
  { name: "Modern Royal Blue", value: "#2563eb" },
  { name: "Deep Emerald", value: "#047857" },
  { name: "Teal Tech", value: "#0f766e" },
  { name: "Executive Charcoal", value: "#1e293b" },
  { name: "Creative Violet", value: "#7c3aed" },
  { name: "Ruby Crimson", value: "#b91c1c" },
];

const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  projects: "Technical Projects",
  skills: "Skills & Tools",
  education: "Education",
  certifications: "Certifications",
  achievements: "Honors & Achievements",
};

export function StepStyleSelection() {
  const { resume, setTemplateId, updateStyle, updatePersonal } = useResumeStore();
  const { style, targetJob, personal } = resume;
  const currentTemplateId = style.templateId;

  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recommendedId, setRecommendedId] = useState<TemplateId>("ats-professional");
  const [recommendReason, setRecommendReason] = useState<string>("");

  useEffect(() => {
    fetch("/api/ai/recommend-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole: targetJob.targetRole,
        experienceLevel: targetJob.experienceLevel,
        industry: targetJob.targetIndustry,
        jobDescription: targetJob.jobDescription,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.recommendedTemplate) {
          setRecommendedId(data.recommendedTemplate);
          setRecommendReason(data.reason);
        }
      })
      .catch(() => {});
  }, [targetJob.targetRole, targetJob.experienceLevel, targetJob.targetIndustry, targetJob.jobDescription]);

  const handleResetRecommended = () => {
    updateStyle({
      font: "inter",
      fontSize: "base",
      accentColor: "#1e3a8a",
      spacing: "normal",
      margins: "normal",
      sectionOrder: ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"],
      showPhoto: false,
      layout: "single",
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const currentOrder = style.sectionOrder?.length
      ? [...style.sectionOrder]
      : ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"];

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    updateStyle({ sectionOrder: currentOrder });
  };

  const handleToggleHideField = (field: keyof NonNullable<typeof personal.hideContactFields>) => {
    const current = personal.hideContactFields || {};
    updatePersonal({
      hideContactFields: {
        ...current,
        [field]: !current[field],
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Choose How Your Resume Should Look
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select an ATS-optimized design. You can preview, customize typography, and switch styles anytime with zero content loss.
        </p>
      </div>

      {/* AI Recommendation Banner */}
      {recommendReason && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-indigo-100/50 to-purple-50 dark:from-indigo-950/40 dark:via-indigo-900/30 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                Recommended for you:{" "}
                <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  {TEMPLATE_REGISTRY[recommendedId]?.name}
                </span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{recommendReason}</p>
            </div>
          </div>
          {currentTemplateId !== recommendedId && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setTemplateId(recommendedId)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex-shrink-0 font-semibold"
            >
              Apply Recommended
            </Button>
          )}
        </motion.div>
      )}

      {/* 6 Real Miniature Resume Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_LIST.map((template) => {
          const isSelected = currentTemplateId === template.id;
          const isRecommended = recommendedId === template.id;
          const TempComp = template.component;

          return (
            <motion.div
              key={template.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                onClick={() => setTemplateId(template.id)}
                className={`group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-300 rounded-xl border-2 h-full ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 shadow-xl ring-2 ring-indigo-600/20 bg-indigo-50/10 dark:bg-indigo-950/10"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg bg-white dark:bg-slate-900"
                }`}
              >
                {/* Selected or Recommended Badges */}
                <div className="absolute top-3 left-3 z-20 flex gap-1.5 items-center">
                  {isSelected && (
                    <Badge className="bg-indigo-600 text-white text-[10px] font-bold py-0.5 px-2 shadow-md gap-1">
                      <Check className="w-3 h-3" /> Selected
                    </Badge>
                  )}
                  {isRecommended && !isSelected && (
                    <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] font-bold py-0.5 px-2">
                      AI Pick
                    </Badge>
                  )}
                </div>

                {/* Top Miniature Realistic Resume Preview */}
                <div className="relative h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800 p-2">
                  <div
                    className={`transform scale-[0.43] origin-top-left w-[232%] pointer-events-none transition-transform duration-300 ${
                      isSelected ? "scale-[0.45]" : "group-hover:scale-[0.45]"
                    }`}
                  >
                    <TempComp
                      data={{
                        ...resume,
                        style: { ...resume.style, templateId: template.id },
                      }}
                      isMiniature
                    />
                  </div>

                  {/* Quick preview hover button */}
                  <div className="absolute inset-0 bg-slate-900/15 dark:bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="shadow-lg font-semibold gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Preview
                    </Button>
                  </div>

                  {/* ATS score indicator */}
                  <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {template.atsCompatibilityPercent}% ATS
                  </div>
                </div>

                {/* Template metadata details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {template.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {template.layout}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">Best for:</span>
                      {template.bestFor.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className={`flex-1 text-xs font-bold ${
                        isSelected
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                      onClick={() => setTemplateId(template.id)}
                    >
                      {isSelected ? "Selected ✓" : "Select"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Style Customization Panel (Collapsed by default, easily expandable) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors duration-200">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Customize Design ({TEMPLATE_REGISTRY[currentTemplateId]?.name})
            </h3>
            <Badge variant="outline" className="text-[10px]">
              Advanced Styling
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResetRecommended();
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Recommended Settings
            </button>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {showAdvanced && (
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-6 text-xs">
            {/* Top Grid: Color, Typography, Font Size, Spacing, Margins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Accent Color */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateStyle({ accentColor: c.value })}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        style.accentColor === c.value
                          ? "border-slate-900 dark:border-white scale-110 shadow-sm ring-2 ring-indigo-500/30"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Typography Font */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  Typography
                </label>
                <select
                  value={style.font}
                  onChange={(e) => updateStyle({ font: e.target.value as any })}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="inter">Inter (Modern Clean)</option>
                  <option value="roboto">Roboto (Standard ATS)</option>
                  <option value="merriweather">Merriweather (Classic Serif)</option>
                  <option value="playfair">Playfair Display (Executive)</option>
                  <option value="geist">Geist Mono (Tech Focused)</option>
                </select>
              </div>

              {/* Font Size & Spacing */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["sm", "base", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateStyle({ fontSize: sz })}
                      className={`py-1 rounded text-center uppercase text-[11px] border font-medium ${
                        style.fontSize === sz
                          ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density & Spacing */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-slate-400" />
                  Density & Spacing
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["compact", "normal", "relaxed"] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => updateStyle({ spacing: sp })}
                      className={`py-1 rounded text-center capitalize border text-[11px] ${
                        style.spacing === sp
                          ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Section Reordering & Field Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Section Ordering */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Section Order (Reorderable)
                </label>
                <div className="space-y-1.5">
                  {(style.sectionOrder?.length
                    ? style.sectionOrder
                    : ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"]
                  ).map((secKey, sIdx, arr) => (
                    <div
                      key={secKey}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {sIdx + 1}. {SECTION_LABELS[secKey] || secKey}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => handleMoveSection(sIdx, "up")}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === arr.length - 1}
                          onClick={() => handleMoveSection(sIdx, "down")}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility Controls: Profile Photo & Contact Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    Profile Photo Visibility
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                    <input
                      type="checkbox"
                      checked={style.showPhoto}
                      onChange={(e) => updateStyle({ showPhoto: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      Show Profile Photo (Recommended only for European/Executive CVs)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    Hide Contact Fields (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(["phone", "location", "linkedin", "github", "portfolio"] as const).map((field) => {
                      const isHidden = !!personal.hideContactFields?.[field];
                      return (
                        <label
                          key={field}
                          className="flex items-center gap-2 p-1.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-white dark:bg-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={isHidden}
                            onChange={() => handleToggleHideField(field)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="capitalize text-slate-700 dark:text-slate-300">
                            Hide {field}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Large Full Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{previewTemplate.name}</span>
                <Badge variant="outline" className="text-xs">
                  {previewTemplate.atsCompatibilityPercent}% ATS Compatibility
                </Badge>
              </DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
              <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white p-3">
                <div className="transform scale-[0.66] origin-top-left w-[151%]">
                  <TemplateRenderer
                    data={{
                      ...resume,
                      style: { ...resume.style, templateId: previewTemplate.id },
                    }}
                    isMiniature
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Recommended Roles</h4>
                  <p>{previewTemplate.bestFor.join(", ")}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Design Specs</h4>
                  <p>Layout: {previewTemplate.layout}</p>
                  <p>Typography: {previewTemplate.recommendedTypography}</p>
                  <p>Color Accent: Controlled</p>
                  <p>ATS Rating: {previewTemplate.atsCompatibilityPercent}% Recruiter Friendly</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Best Use Cases</h4>
                  <p>Applications targeting high-volume corporate Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo).</p>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  onClick={() => {
                    setTemplateId(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Back
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
