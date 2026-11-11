"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Award } from "lucide-react";

export function StepCertifications() {
  const { resume, addCertification, updateCertification, removeCertification } = useResumeStore();
  const { certifications } = resume;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Licenses & Certifications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Include technical certifications (AWS, Coursera, Google, Microsoft, Meta).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addCertification()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Certificate
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
          <Award className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No certifications added</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">You can optionally add your credentials or skip this step.</p>
          <Button size="sm" onClick={() => addCertification()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Certificate
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((c, idx) => (
            <div
              key={c.id}
              className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm space-y-3 relative transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Certification #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(c.id)}
                  className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Certification Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={c.name}
                    onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Cloud Practitioner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issuing Organization <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={c.issuer}
                    onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date / Year
                  </label>
                  <Input
                    value={c.issueDate}
                    onChange={(e) => updateCertification(c.id, { issueDate: e.target.value })}
                    placeholder="e.g. 2024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credential URL / Verification Link
                  </label>
                  <Input
                    value={c.credentialUrl || ""}
                    onChange={(e) => updateCertification(c.id, { credentialUrl: e.target.value })}
                    placeholder="https://..."
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
