"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="brand" className="text-xs">
            Transparent Pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Invest in Your Career Acceleration
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Start for free, or unlock unlimited AI rewrites, advanced ATS diagnostics, and DOCX exports.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-300 dark:border-emerald-800">
                Save 40%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter Free</h3>
                  <Badge variant="secondary" className="text-xs">Free Forever</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Essential tools for students and job seekers creating their first resume.
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ forever</span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    "1 Active Resume",
                    "Standard ATS Professional Template",
                    "Basic AI Content Improvements",
                    "Selectable Vector PDF Export",
                    "Instant Live Preview Editor",
                    "Local Draft Autosave",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/create" className="w-full">
                <Button variant="outline" className="w-full font-bold text-xs">
                  Get Started Free
                </Button>
              </Link>
            </Card>
          </motion.div>

          {/* Pro Tier */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-2xl border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xl relative flex flex-col justify-between space-y-6 h-full">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro Unlimited</h3>
                  <Badge className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold text-xs">
                    All Features
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full AI power, ATS audit breakdown, job description matching, and Word DOCX export.
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {billingCycle === "annual" ? "$9" : "$15"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / month {billingCycle === "annual" ? "(billed annually)" : ""}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    "Unlimited Resumes & Versions",
                    "Access All 6 Professional Templates",
                    "Advanced AI Action-Verb Generator",
                    "Full ATS Compatibility Score & Breakdown",
                    "Job Description Keyword Matcher",
                    "Editable Word DOCX Export",
                    "Selectable Vector PDF Export",
                    "Multi-Version Role Tailoring (AI/ML, Web, etc.)",
                    "Version History Snapshot & Restore",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/create" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 font-bold text-xs gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Start Pro Experience
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Guarantee Banner */}
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <p>
            ResumeForge AI strictly respects candidate data integrity. We never sell your resume data, and AI outputs are verified to prevent hallucinated credentials.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
