"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TEMPLATE_LIST, TemplateDefinition } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { sampleResumeData } from "@/lib/sample-data";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function TemplatesPage() {
  const router = useRouter();
  const setTemplateId = useResumeStore((state) => state.setTemplateId);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const handleUseTemplate = (templateDef: TemplateDefinition) => {
    setTemplateId(templateDef.id);
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="brand" className="text-xs">
            ATS-Engineered Templates
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Professional Resume Templates
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every template is tested with major Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo) to guarantee 100% text readability.
          </p>
        </div>

        {/* Templates Grid with realistic miniature previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATE_LIST.map((template) => {
            const TempComp = template.component;

            return (
              <motion.div
                key={template.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group flex flex-col overflow-hidden border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-300 bg-white dark:bg-slate-900 h-full">
                  {/* Miniature Resume Preview */}
                  <div
                    className="relative h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800 p-2 cursor-pointer"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <div className="transform scale-[0.44] origin-top-left w-[227%] pointer-events-none group-hover:scale-[0.46] transition-transform duration-300">
                      <TempComp data={sampleResumeData} isMiniature />
                    </div>

                    <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="shadow-lg gap-1.5 font-semibold text-xs">
                        <Eye className="w-3.5 h-3.5" /> Full Preview
                      </Button>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                      ★ {template.atsCompatibilityPercent}% ATS
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {template.name}
                        </h3>
                        <Badge variant="outline" className="text-[11px] text-slate-600 dark:text-slate-300">
                          {template.layout}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {template.bestFor.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />

      {/* Full Preview Modal */}
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
                <div className="transform scale-[0.68] origin-top-left w-[147%]">
                  <TemplateRenderer
                    data={{
                      ...sampleResumeData,
                      style: { ...sampleResumeData.style, templateId: previewTemplate.id },
                    }}
                    isMiniature
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Recommended Roles</h4>
                  <p>{previewTemplate.bestFor.join(", ")}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Typography & Structure</h4>
                  <p>Font: {previewTemplate.recommendedTypography}</p>
                  <p>Structure: {previewTemplate.layout}</p>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
