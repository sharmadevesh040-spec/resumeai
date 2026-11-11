"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { StepPersonal } from "@/components/wizard/StepPersonal";
import { StepEducation } from "@/components/wizard/StepEducation";
import { StepExperience } from "@/components/wizard/StepExperience";
import { StepProjects } from "@/components/wizard/StepProjects";
import { StepSkills } from "@/components/wizard/StepSkills";
import { StepTargetJob } from "@/components/wizard/StepTargetJob";
import { StepCredentials } from "@/components/wizard/StepCredentials";
import { StepStyleSelection } from "@/components/wizard/StepStyleSelection";
import { StepGenerate } from "@/components/wizard/StepGenerate";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AutoGenerateForm } from "@/components/import/AutoGenerateForm";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Zap, Github, Linkedin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Personal",
  "Education",
  "Experience",
  "Projects",
  "Skills",
  "Target Job",
  "Credentials",
  "Style",
  "Generate",
];

export default function CreateResumePage() {
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const { activeStep, setActiveStep, isSaving, lastSavedText, loadSample, loadBlank, resume } =
    useResumeStore();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!resume.personal.fullName?.trim() || !resume.personal.email?.trim()) {
        alert("Please enter at least your Full Name and Email before proceeding.");
        return;
      }
    }
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60 text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <WizardProgress
        currentStep={activeStep}
        totalSteps={STEPS.length}
        steps={STEPS}
        onStepClick={(idx) => {
          if (idx <= activeStep || resume.personal.fullName) {
            setActiveStep(idx);
          }
        }}
      />

      {/* Main Form Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* One-Click Import Highlight Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-amber-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">Want to save 15 minutes?</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  New
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Import your LinkedIn &amp; GitHub profiles automatically. Our AI will extract your projects, skills, and experience in 1 click.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowAutoImportModal(true)}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md gap-1.5 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Import &amp; Generate Automatically
          </Button>
        </div>

        {/* Dialog Modal for Auto Import inside Wizard */}
        <Dialog open={showAutoImportModal} onOpenChange={setShowAutoImportModal}>
          <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto bg-transparent border-none p-0 shadow-none">
            <AutoGenerateForm
              onSuccess={() => {
                setShowAutoImportModal(false);
                setActiveStep(7); // Jump straight to style & preview
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Helper Toolbar: Autosave status & demo data loader */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {isSaving ? "Autosaving..." : lastSavedText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Load Sample Data (Devesh)
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={loadBlank}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start Blank
            </button>
          </div>
        </div>

        {/* Step Views with Framer Motion Smooth Step Transition */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {activeStep === 0 && <StepPersonal />}
              {activeStep === 1 && <StepEducation />}
              {activeStep === 2 && <StepExperience />}
              {activeStep === 3 && <StepProjects />}
              {activeStep === 4 && <StepSkills />}
              {activeStep === 5 && <StepTargetJob />}
              {activeStep === 6 && <StepCredentials />}
              {activeStep === 7 && <StepStyleSelection />}
              {activeStep === 8 && <StepGenerate />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        {activeStep < 8 && (
          <div className="flex items-center justify-between mt-8 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={activeStep === 0}
              className="gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-sm shadow-indigo-600/25"
            >
              {activeStep === 7 ? "Review & Generate" : "Save & Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
