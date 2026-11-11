import React from "react";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onStepClick: (stepIndex: number) => void;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
}: WizardProgressProps) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 sticky top-16 z-30 px-4 py-3 sm:py-4 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {steps[currentStep]}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
            {percentage}% Complete
          </span>
        </div>

        {/* Animated Progress bar line */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Desktop clickable step circles */}
        <div className="hidden lg:flex items-center justify-between mt-3 text-xs">
          {steps.map((label, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onStepClick(idx)}
                className={`flex items-center gap-1.5 transition-colors ${
                  isCurrent
                    ? "font-bold text-indigo-600 dark:text-indigo-400"
                    : isCompleted
                    ? "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-indigo-600 text-white"
                      : isCompleted
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span className="truncate max-w-[85px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
