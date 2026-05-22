"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="text-sm text-green-400 animate-fade-in">
        Thanks for subscribing! We&apos;ll keep you posted on new blueprints and creator tips.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all active:scale-95 shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
