"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { TEMPLATE_LIST, TEMPLATE_REGISTRY } from "@/templates/registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { downloadPdf, downloadDocx, triggerPrintResume } from "@/lib/pdf/client-download";
import {
  Download,
  FileText,
  FileCheck,
  Printer,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  Save,
  Check,
  ArrowLeft,
  History,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VersionSnapshot {
  id: string;
  title: string;
  timestamp: string;
  data: any;
}

export function EditorHeader() {
  const { resume, setTemplateId, isSaving, editorZoom, setEditorZoom, setResume } =
    useResumeStore();
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setShowDownloadMenu(false);
    try {
      await downloadPdf(resume);
    } catch {
      triggerPrintResume();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    setShowDownloadMenu(false);
    try {
      await downloadDocx(resume);
    } catch {
      alert("Failed to export DOCX. Try printing to PDF instead.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCreateSnapshot = () => {
    const newSnapshot: VersionSnapshot = {
      id: "ver-" + Date.now(),
      title: `Snapshot — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      timestamp: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      data: JSON.parse(JSON.stringify(resume)),
    };
    setSnapshots([newSnapshot, ...snapshots]);

    // Also persist snapshot to server if resume has ID
    if (resume.id) {
      fetch(`/api/resume/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          saveAsVersion: true,
          versionTitle: newSnapshot.title,
        }),
      }).catch(() => {});
    }
  };

  const handleRestoreSnapshot = (snap: VersionSnapshot) => {
    if (confirm(`Restore ${snap.title}? Your current unsaved edits will be replaced.`)) {
      setResume(snap.data);
      setShowVersionModal(false);
    }
  };

  const currentTemplate = TEMPLATE_REGISTRY[resume.style.templateId] || TEMPLATE_REGISTRY["ats-professional"];

  return (
    <>
      <header className="h-14 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs no-print transition-colors duration-200">
        {/* Left branding & resume title */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Back to Dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs">
              {resume.title || "Resume"}
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-slate-500 dark:text-slate-400">
              {currentTemplate.name}
            </Badge>
          </div>

          {/* Exact Autosave Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono select-none">
            <span className={`w-2 h-2 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
            <span className={isSaving ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-emerald-700 dark:text-emerald-400 font-semibold"}>
              {isSaving ? "Saving..." : "Saved ✓"}
            </span>
          </div>
        </div>

        {/* Center Zoom Controls (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setEditorZoom(editorZoom - 0.1)}
            className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded hover:shadow-xs transition-all text-slate-700 dark:text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] text-slate-800 dark:text-slate-200">{Math.round(editorZoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setEditorZoom(editorZoom + 0.1)}
            className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded hover:shadow-xs transition-all text-slate-700 dark:text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Template Switcher Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Template:</span> {currentTemplate.name}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Button>

            <AnimatePresence>
              {showTemplateMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-1"
                >
                  <p className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Switch Template (No Data Loss)
                  </p>
                  {TEMPLATE_LIST.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTemplateId(t.id);
                        setShowTemplateMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        resume.style.templateId === t.id
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{t.name}</span>
                      {resume.style.templateId === t.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Saved Versions Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionModal(true)}
            className="hidden sm:flex text-xs font-semibold gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Versions ({snapshots.length})</span>
          </Button>

          {/* Download Dropdown */}
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
              <ChevronDown className="w-3 h-3" />
            </Button>

            <AnimatePresence>
              {showDownloadMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-1 text-xs"
                >
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isExportingPdf ? "Generating..." : "Download PDF (Vector ATS)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    disabled={isExportingDocx}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{isExportingDocx ? "Generating..." : "Download DOCX (Word)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDownloadMenu(false);
                      triggerPrintResume();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium border-t border-slate-100 dark:border-slate-800"
                  >
                    <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Print Resume</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Version Snapshots Modal with Polish Empty State */}
      {showVersionModal && (
        <Dialog open={showVersionModal} onOpenChange={setShowVersionModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Version Snapshots</span>
                <Button size="sm" onClick={handleCreateSnapshot} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  + Create Snapshot
                </Button>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Save checkpoints to experiment with different resume templates and content versions safely.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3">
              {snapshots.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No saved versions"
                  description="You haven't created any version snapshots yet. Create one now to preserve your current progress."
                  actionLabel="+ Create Snapshot"
                  onAction={handleCreateSnapshot}
                />
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{snap.title}</p>
                        <p className="text-[10px] text-slate-400">{snap.timestamp}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="text-xs h-7 gap-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
