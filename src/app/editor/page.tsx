"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorSectionsLeft } from "@/components/editor/EditorSectionsLeft";
import { EditorPreviewCenter } from "@/components/editor/EditorPreviewCenter";
import { EditorAiPanelRight } from "@/components/editor/EditorAiPanelRight";
import { EditorMobileNav } from "@/components/editor/EditorMobileNav";

function EditorContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const { resume, setResume, activeEditorTab } = useResumeStore();

  useEffect(() => {
    if (resumeId && resumeId !== resume.id) {
      fetch(`/api/resume/${resumeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.resume) {
            setResume(data.resume);
          }
        })
        .catch(() => {});
    }
  }, [resumeId, resume.id, setResume]);

  const [showTabletAiDrawer, setShowTabletAiDrawer] = React.useState(false);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <EditorHeader />

      {/* Main Multi-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Form & Sections (Mobile tab 'edit', always visible on md+) */}
        <div
          className={`w-full md:w-[340px] xl:w-[390px] h-full flex-shrink-0 z-10 transition-all ${
            activeEditorTab === "edit" ? "block" : "hidden md:block"
          }`}
        >
          <EditorSectionsLeft />
        </div>

        {/* Center Column: Live Reactive Resume Preview (Mobile tab 'preview', always visible on md+) */}
        <div
          className={`flex-1 h-full overflow-hidden relative transition-all ${
            activeEditorTab === "preview" ? "block" : "hidden md:block"
          }`}
        >
          <EditorPreviewCenter />

          {/* Tablet Floating AI Toggle Button (768px - 1279px) */}
          <div className="hidden md:block xl:hidden absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setShowTabletAiDrawer(!showTabletAiDrawer)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>{showTabletAiDrawer ? "Hide AI Assistant" : "AI & Score"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Assistant & ATS Score Diagnostics (Mobile tab 'ai'/'score', visible on xl+ or when drawer open on tablet) */}
        <div
          className={`w-full md:w-[360px] xl:w-[380px] h-full flex-shrink-0 z-30 transition-all ${
            activeEditorTab === "ai" || activeEditorTab === "score"
              ? "block"
              : showTabletAiDrawer
              ? "block absolute top-0 right-0 h-full shadow-2xl z-30"
              : "hidden xl:block"
          }`}
        >
          <EditorAiPanelRight />
        </div>
      </div>

      {/* Mobile Sticky Navigation (< 768px) */}
      <div className="md:hidden">
        <EditorMobileNav />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading ResumeForge Live Editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
