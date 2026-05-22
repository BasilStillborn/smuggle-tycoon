"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { getCategories } from "@/lib/data";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default function CreatePage() {
  const { isAuthenticated, user } = useApp();
  const categories = getCategories();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("forge_onboarded");
    if (!onboarded && user?.role === "creator") {
      setShowOnboarding(true);
    }
  }, [user]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    categoryId: "",
    difficulty: "beginner",
    tags: "",
    steps: "3",
    tokens: "1000",
    compatibleModels: "",
    includes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setResult(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        longDescription: form.longDescription,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
        authorId: user.id,
        difficulty: form.difficulty,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        steps: parseInt(form.steps) || 3,
        tokens: parseInt(form.tokens) || 1000,
        compatibleModels: form.compatibleModels
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        includes: form.includes
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/v1/create-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          status: "success",
          message:
            "Your blueprint has been submitted for review. An administrator will review it before it's published to the marketplace.",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setResult({
          status: "error",
          message: data.error || "Failed to submit blueprint.",
        });
      }
    } catch {
      setResult({
        status: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (showOnboarding && user) {
    return (
      <OnboardingWizard
        userName={user.name}
        onComplete={() => {
          localStorage.setItem("forge_onboarded", "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-(--muted) mb-6">You need to sign in to create a blueprint listing.</p>
        <a
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (result?.status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">Submitted for Review!</h1>
        <p className="text-(--muted) mb-2 max-w-md mx-auto">
          {result.message}
        </p>
        <p className="text-xs text-amber-500 mb-6">
          Blueprints are not visible in the marketplace until approved by an administrator.
        </p>
        <a
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Browse Marketplace
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Blueprint</h1>
        <p className="text-(--muted) text-sm">
          Share your prompt engineering expertise with the world
        </p>
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-500 text-xs">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Submissions go through admin review before being published.
        </div>
      </div>

      {result?.status === "error" && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
          <h2 className="font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g., The Perfect Blog Post Generator"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Short Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={2}
                placeholder="A brief one-line description of your blueprint"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Detailed Description *</label>
              <textarea
                name="longDescription"
                value={form.longDescription}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your blueprint in detail. What does it do? How many steps? What makes it special?"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
          <h2 className="font-semibold mb-4">Pricing & Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (USD) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="29.99"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Difficulty *</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="writing, seo, blogging"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
          <h2 className="font-semibold mb-4">Blueprint Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Number of Steps *</label>
              <input
                type="number"
                name="steps"
                value={form.steps}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Token Budget *</label>
              <input
                type="number"
                name="tokens"
                value={form.tokens}
                onChange={handleChange}
                required
                min="100"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">Compatible Models</label>
            <input
              type="text"
              name="compatibleModels"
              value={form.compatibleModels}
              onChange={handleChange}
              placeholder="GPT-4, Claude 3, Gemini Pro"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">What&apos;s Included (one per line)</label>
            <textarea
              name="includes"
              value={form.includes}
              onChange={handleChange}
              rows={4}
              placeholder="Prompt chain (5 steps)&#10;Variables guide&#10;Output templates&#10;SEO checklist"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 resize-none"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div className="text-sm text-(--muted)">
              <p className="font-medium text-indigo-400 mb-1">Platform Commission</p>
              <p>A 20% platform commission will be applied to each sale. You will receive 80% of the listed price for every purchase.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98] disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting for Review...
            </span>
          ) : (
            "Submit Blueprint for Review"
          )}
        </button>
      </form>
    </div>
  );
}
