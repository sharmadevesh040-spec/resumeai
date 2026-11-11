"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  Zap,
  Target,
  Layers,
  FileCheck,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TEMPLATE_LIST, TemplateDefinition } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { sampleResumeData } from "@/lib/sample-data";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { AutoGenerateForm } from "@/components/import/AutoGenerateForm";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, FloatingElement } from "@/components/ui/motion";

export default function LandingPage() {
  const router = useRouter();
  const setTemplateId = useResumeStore((state) => state.setTemplateId);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const handleUseTemplate = (templateDef: TemplateDefinition) => {
    setTemplateId(templateDef.id);
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Hero Section with Ambient Glow and Grid Background */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-background to-background dark:from-indigo-950/20 dark:via-background dark:to-background bg-grid-pattern">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy with Staggered Fade In */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={{
                initial: {},
                animate: { transition: { staggerChildren: 0.1 } },
              }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <motion.div
                variants={{
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/95 border border-slate-700/60 dark:border-slate-800 text-slate-200 text-xs font-mono shadow-md backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span>ATS Engine 2.0 · Gemini AI · 99.2% Accuracy</span>
              </motion.div>

              <motion.h1
                variants={{
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white"
              >
                Build a Resume That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400">
                  Gets Noticed.
                </span>
              </motion.h1>

              <motion.p
                variants={{
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Turn your experience, skills, and projects into a professional ATS-friendly resume with AI. No fluff, no fabrication—just impactful results.
              </motion.p>

              <motion.div
                variants={{
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link href="#auto-import" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="tactile" size="lg" className="w-full sm:w-auto gap-2 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30">
                      <Sparkles className="w-4 h-4" />
                      Auto-Generate with AI
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/create" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="tactileSilver" size="lg" className="w-full sm:w-auto text-base font-semibold">
                      Manual Wizard
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Recruiter trust indicators */}
              <motion.div
                variants={{
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>99% ATS Pass Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Selectable Vector PDF</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Editable DOCX Export</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Visual with Interactive Resume & Floating Elements */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-2 sm:p-3 overflow-hidden backdrop-blur-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 px-2 text-xs text-slate-400">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">resumeforge.app/editor/live</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    Live Sync
                  </Badge>
                </div>

                {/* Actual Miniature High Fidelity Resume Preview (Pristine White Document) */}
                <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-2 max-h-[480px] overflow-hidden relative shadow-inner">
                  {/* Lookap-style blueprint overlay specs */}
                  <div className="absolute top-4 right-4 z-20 hidden sm:flex pointer-events-none">
                    <span className="spec-tag">
                      <span className="spec-dot-emerald" />
                      8.5 x 11 in · r 8 · A4/Letter
                    </span>
                  </div>

                  <div className="transform scale-[0.68] sm:scale-[0.72] origin-top-left w-[140%] pointer-events-none">
                    <TemplateRenderer data={sampleResumeData} isMiniature />
                  </div>

                  {/* Lookap-style bottom blueprint tag */}
                  <div className="absolute bottom-4 right-4 z-20 hidden sm:flex pointer-events-none">
                    <span className="spec-tag">
                      <span className="spec-dot-indigo" />
                      100% Vector PDF · Selectable Text
                    </span>
                  </div>
                </div>

                {/* Floating UI Elements with smooth levitation */}
                <FloatingElement
                  yOffset={5}
                  duration={3.8}
                  className="absolute top-8 -left-3 sm:-left-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl p-3 shadow-xl flex items-center gap-3 z-10"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    94
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">ATS Score 94/100</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Ready for submission</p>
                  </div>
                </FloatingElement>

                <FloatingElement
                  yOffset={6}
                  duration={4.2}
                  delay={0.5}
                  className="absolute top-1/2 -right-3 sm:-right-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl p-3 shadow-xl flex items-center gap-3 z-10"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">AI Optimized</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Strong action verbs</p>
                  </div>
                </FloatingElement>

                <FloatingElement
                  yOffset={4}
                  duration={3.4}
                  delay={1}
                  className="absolute -bottom-3 left-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl p-3 shadow-xl flex items-center gap-3 z-10"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm">
                    91%
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">Job Match 91%</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Software Developer</p>
                  </div>
                </FloatingElement>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Automatic One-Click Generator Section */}
      <section id="auto-import" className="py-16 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AutoGenerateForm />
        </div>
      </section>

      {/* Template Preview Section */}
      <section id="templates" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="brand" className="text-xs">
              Recruiter & ATS Tested
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose How Your Resume Should Look
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Every design is meticulously structured for applicant tracking systems. Switch templates anytime with zero content loss.
            </p>
          </div>

          {/* Actual Miniature Template Cards Grid with Framer Motion Stagger */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATE_LIST.map((template) => {
              const TempComp = template.component;
              return (
                <motion.div
                  key={template.id}
                  variants={{
                    initial: { opacity: 0, y: 16 },
                    animate: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="group flex flex-col overflow-hidden border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-300 bg-white dark:bg-slate-900 h-full">
                    {/* Miniature Resume Preview Area */}
                    <div
                      className="relative h-64 bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800 p-2 cursor-pointer"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <div className="transform scale-[0.44] origin-top-left w-[227%] pointer-events-none group-hover:scale-[0.46] transition-transform duration-300">
                        <TempComp data={sampleResumeData} isMiniature />
                      </div>

                      {/* Hover Overlay with Preview prompt */}
                      <div className="absolute inset-0 bg-slate-900/15 dark:bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <Button variant="secondary" size="sm" className="shadow-lg gap-1.5 font-semibold text-xs">
                          <Eye className="w-3.5 h-3.5" /> Full Preview
                        </Button>
                      </div>

                      {/* ATS Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                        ★ {template.atsCompatibilityPercent}% ATS
                      </div>
                    </div>

                    {/* Card Details */}
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
                          {template.bestFor.slice(0, 3).map((tag, idx) => (
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
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="brand" className="text-xs">
              Simple 5-Step Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How ResumeForge AI Works
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              From raw thoughts to a polished, recruiter-ready resume in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Enter your information",
                desc: "Add your education, work history, projects, and target role.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Choose your style",
                desc: "Select an ATS-optimized template with realistic preview.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Let AI improve your content",
                desc: "Turn weak descriptions into high-impact action bullets.",
                icon: Sparkles,
              },
              {
                step: "04",
                title: "Check ATS score",
                desc: "Get keyword match analysis and recruiter recommendations.",
                icon: BarChart3,
              },
              {
                step: "05",
                title: "Download your resume",
                desc: "Export clean vector PDF or editable Word DOCX instantly.",
                icon: Download,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="brand" className="text-xs">
              Complete SaaS Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Candidate Success
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Everything you need to bypass automated resume filters and impress hiring managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Resume Writing",
                desc: "Transforms raw experiences into punchy Google X-Y-Z bullet points without fabricating false credentials.",
              },
              {
                icon: ShieldCheck,
                title: "ATS Optimization",
                desc: "Every heading, font, margin, and structure is verified against applicant tracking system parsers.",
              },
              {
                icon: Target,
                title: "Job Description Matching",
                desc: "Paste any job posting to analyze skill gaps, required qualifications, and missing keywords in real time.",
              },
              {
                icon: SlidersHorizontal,
                title: "Live Resume Editor",
                desc: "Zero-latency 3-pane live editor with instant layout adjustments, color accents, and section ordering.",
              },
              {
                icon: BarChart3,
                title: "ATS Compatibility Score",
                desc: "Detailed 0-100 score breakdown across keywords, readability, structure, and formatting metrics.",
              },
              {
                icon: FileCheck,
                title: "Selectable Vector PDF",
                desc: "Server-side and client-side vector text rendering ensures parsers read exact text without pixelation.",
              },
              {
                icon: FileText,
                title: "Editable DOCX Export",
                desc: "Generate perfectly structured Microsoft Word documents with headings and clean bullets.",
              },
              {
                icon: Layers,
                title: "Multiple Resume Versions",
                desc: "Tailor separate resume versions for Software, AI/ML, and Internship applications from one profile.",
              },
              {
                icon: Zap,
                title: "Instant Template Switching",
                desc: "Switch between 6 distinct professional templates instantly without re-entering data or losing formatting.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  className="p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Land Your Next Interview?
          </h2>
          <p className="text-indigo-200 text-base max-w-2xl mx-auto">
            Build your ATS-optimized resume today with ResumeForge AI. No credit card required.
          </p>
          <div>
            <Link href="/create">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-bold px-8 shadow-xl">
                Create My Resume Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Full Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{previewTemplate.name} Template</span>
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
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Best For</h4>
                  <p>{previewTemplate.bestFor.join(", ")}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Layout & Typography</h4>
                  <p>Structure: {previewTemplate.layout}</p>
                  <p>Typography: {previewTemplate.recommendedTypography}</p>
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
