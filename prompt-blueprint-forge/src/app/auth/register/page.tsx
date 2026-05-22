"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      login(data.user);
      setDone(true);
      setTimeout(() => router.push("/marketplace"), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
          <p className="text-(--muted)">Redirecting to marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            PB
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-(--muted) mt-1">Join the Prompt Blueprint Forge</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-(--border) bg-(--card) space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-xs text-(--muted)">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
