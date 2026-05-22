"use client";

import { useState } from "react";

interface OnboardingWizardProps {
  onComplete: () => void;
  userName: string;
}

const steps = [
  {
    title: "Welcome to PromptForge!",
    subtitle: "Your journey as a Blueprint creator starts here.",
    content: `
      You're now part of a community of prompt engineers and AI enthusiasts
      who craft structured prompt chains — called Blueprints — for the
      marketplace.
    `,
    graphic: "🎨",
  },
  {
    title: "What is a Blueprint?",
    subtitle: "Think of it as a recipe for AI",
    content: `
      A Blueprint is a multi-step prompt chain designed to accomplish
      a specific task. Unlike a single prompt, Blueprints include:
      chain-of-thought logic, variable templates, output formatting,
      and compatibility notes for different AI models.
    `,
    graphic: "📋",
  },
  {
    title: "Commission Structure",
    subtitle: "You earn 80% of every sale",
    content: `
      PromptForge retains a 20% platform commission. You receive the
      remaining 80% as net revenue. For a $29.99 Blueprint, you earn
      $23.99. Payouts are processed monthly for balances over $10.00.
    `,
    graphic: "💰",
  },
  {
    title: "The Review Process",
    subtitle: "Quality is our priority",
    content: `
      Every Blueprint goes through admin review before appearing in
      the marketplace. This ensures buyers get high-quality, functional
      prompt chains. Most reviews are completed within 24-48 hours.
      If rejected, you'll get detailed notes on what to improve.
    `,
    graphic: "✅",
  },
  {
    title: "Ready to Create?",
    subtitle: "Let's build your first Blueprint",
    content: `
      Head to the Create page to submit your first Blueprint.
      Remember: include clear instructions, test with multiple models,
      and be specific about what your Blueprint accomplishes.
    `,
    graphic: "🚀",
  },
];

export function OnboardingWizard({ onComplete, userName }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) shadow-2xl overflow-hidden animate-slide-up">
        {/* Progress bar */}
        <div className="h-1 bg-(--border)">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= currentStep ? "bg-indigo-500" : "bg-(--border)"
                }`}
              />
            ))}
          </div>

          {/* Graphic */}
          <div className="text-5xl text-center mb-6 animate-float">
            {step.graphic}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-1">{step.title}</h2>
          <p className="text-sm text-(--muted) text-center mb-4">{step.subtitle}</p>

          {/* Content */}
          <p className="text-sm text-(--muted) leading-relaxed text-center mb-8">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setDismissed(true)}
              className="text-sm text-(--muted) hover:text-(--foreground) transition-colors"
            >
              Skip tutorial
            </button>
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="px-4 py-2 rounded-xl border border-(--border) text-sm font-medium hover:bg-(--card-hover) transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (isLast) {
                    setDismissed(true);
                    onComplete();
                  } else {
                    setCurrentStep((s) => s + 1);
                  }
                }}
                className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all"
              >
                {isLast ? "Let's Go! 🚀" : "Continue"}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-4 text-center">
          <p className="text-xs text-(--muted)">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
