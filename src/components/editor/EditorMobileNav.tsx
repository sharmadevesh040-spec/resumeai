"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { downloadPdf } from "@/lib/pdf/client-download";
import { Edit3, Eye, Sparkles, BarChart3, Download } from "lucide-react";

export function EditorMobileNav() {
  const { activeEditorTab, setActiveEditorTab, resume } = useResumeStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg no-print transition-colors duration-200">
      <button
        type="button"
        onClick={() => setActiveEditorTab("edit")}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-lg transition-colors ${
          activeEditorTab === "edit"
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Edit3 className="w-4 h-4" />
        <span>Edit</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveEditorTab("preview")}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-lg transition-colors ${
          activeEditorTab === "preview"
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Preview</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveEditorTab("ai")}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-lg transition-colors ${
          activeEditorTab === "ai"
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>AI Assistant</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveEditorTab("score")}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-lg transition-colors ${
          activeEditorTab === "score"
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Score</span>
      </button>

      <button
        type="button"
        onClick={() => downloadPdf(resume)}
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 py-1 px-3 rounded-lg"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  );
}
