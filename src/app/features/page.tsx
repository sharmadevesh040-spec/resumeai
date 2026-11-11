"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShieldCheck,
  Target,
  SlidersHorizontal,
  BarChart3,
  FileCheck,
  FileText,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Resume Writing with Honesty Engine",
      desc: "Transforms weak, passive descriptions into compelling Google X-Y-Z action bullet points without fabricating employers, degrees, or false metrics.",
    },
    {
      icon: ShieldCheck,
      title: "ATS Compatibility Optimization",
      desc: "Eliminates complex graphical elements, tables, and inaccessible formats that choke applicant tracking systems like Workday and Taleo.",
    },
    {
      icon: Target,
      title: "Job Description Keyword Matching",
      desc: "Paste any job vacancy description to instantly audit your match score, missing crucial skills, and target role relevance.",
    },
    {
      icon: SlidersHorizontal,
      title: "Zero-Latency Live Editor",
      desc: "Split-pane layout with instant reactive preview. Adjust fonts, spacing, margins, and accent colors without waiting for reloads.",
    },
    {
      icon: BarChart3,
      title: "In-Depth Resume Compatibility Score",
      desc: "Provides a 0-100 diagnostic score with clear breakdowns across keywords, structure, skills, experience, and readability.",
    },
    {
      icon: FileCheck,
      title: "Selectable Vector PDF Export",
      desc: "Generates genuine vector text streams in PDF format rather than raster images, ensuring 100% ATS text readability.",
    },
    {
      icon: FileText,
      title: "Editable Word DOCX Export",
      desc: "Downloads an editable, beautifully formatted Microsoft Word document with correct header hierarchies and bullet indentation.",
    },
    {
      icon: Layers,
      title: "Multi-Role Resume Variations",
      desc: "Maintain multiple customized versions (e.g. Software Developer, AI/ML, Internship) from a single shared profile.",
    },
    {
      icon: Zap,
      title: "Instant 6-Template Switching",
      desc: "Switch between ATS Professional, Modern Minimal, Tech Pro, Student, Executive, and Creative templates anytime with no data loss.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="brand" className="text-xs">
            Product Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Features Built for Serious Job Seekers
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Every feature in ResumeForge AI is designed to maximize your callback rate while keeping your resume honest, professional, and readable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center pt-8">
          <Link href="/create">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold">
              Build Your Resume Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
