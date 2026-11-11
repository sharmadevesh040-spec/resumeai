import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                ResumeForge AI
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Build an ATS-optimized, recruiter-approved resume in minutes with intelligent AI bullet improvement, job description matching, and vector PDF export.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium pt-2">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 100% ATS Compliant
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-4 h-4" /> Data Privacy First
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              Templates
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  ATS Professional
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Tech Pro (Engineering)
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Modern Minimal
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Student & Fresher
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Executive Leader
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AI Resume Writing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  ATS Compatibility Score
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Job Description Matching
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              Get Started
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/create" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-indigo-600 dark:text-indigo-400">
                  Create Resume Now
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">ATS Compliance Guide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
