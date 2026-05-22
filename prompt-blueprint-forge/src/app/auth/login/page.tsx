"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { getUsers } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = getUsers();
    const user = users.find((u) => u.email === email);

    if (user) {
      login(user);
      router.push("/marketplace");
    } else {
      setError("Invalid email or password. Try demo@example.com.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            PB
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-(--muted) mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-(--border) bg-(--card) space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="any password will work"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            Sign In
          </button>

          <p className="text-center text-xs text-(--muted)">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
              Register
            </Link>
          </p>

          <div className="p-3 rounded-xl bg-(--card-hover) border border-(--border)">
            <p className="text-xs text-(--muted) text-center">
              Demo account: <strong className="text-(--foreground)">demo@example.com</strong> (any password)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
