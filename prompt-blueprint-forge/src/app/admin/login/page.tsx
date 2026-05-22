"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/adminStore";
import { getUsers } from "@/lib/data";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isAdmin } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAdmin) {
    router.push("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = getUsers();
    const admin = users.find((u) => u.email === email && u.role === "admin");

    if (admin) {
      adminLogin(admin);
      router.push("/admin");
    } else {
      setError("Invalid admin credentials. Use admin@promptforge.com.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            PB
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            Internal tool. Admin access only.
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@promptforge.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all active:scale-[0.98]"
          >
            Access Dashboard
          </button>

          <p className="text-center text-xs text-slate-500">
            Demo: <strong className="text-slate-400">admin@promptforge.com</strong> (any password)
          </p>
        </form>
      </div>
    </div>
  );
}
