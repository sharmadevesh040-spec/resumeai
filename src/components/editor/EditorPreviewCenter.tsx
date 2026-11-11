"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { motion } from "framer-motion";

export function EditorPreviewCenter() {
  const { resume, editorZoom } = useResumeStore();

  return (
    <div className="w-full h-full overflow-auto bg-slate-200/70 dark:bg-[#070b14] p-4 sm:p-8 flex justify-center items-start transition-colors duration-200">
      <motion.div
        animate={{ scale: editorZoom }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full max-w-[820px] origin-top shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-300 dark:border-slate-800 dark:ring-1 dark:ring-white/10"
      >
        <TemplateRenderer data={resume} />
      </motion.div>
    </div>
  );
}
