"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";

export function Header() {
  const { user, isAuthenticated, cartCount, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
              PB
            </div>
            <span className="font-bold text-lg">
              <span className="gradient-text">Prompt</span>
              <span className="text-(--foreground)">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
            >
              Home
            </Link>
            <Link
              href="/marketplace"
              className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
            >
              Create
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-(--muted) hover:text-(--foreground) transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-(--muted)">{user?.name?.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-(--muted) hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-(--border) text-(--foreground) text-sm font-medium hover:bg-(--card-hover) transition-all active:scale-95"
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-(--muted) hover:text-(--foreground)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-(--border) pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/marketplace" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Marketplace</Link>
              <Link href="/create" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Create Listing</Link>
              {!isAuthenticated && (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link href="/auth/register" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
              {isAuthenticated && (
                <Link href="/dashboard" className="text-sm font-medium text-(--muted) hover:text-(--foreground)" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
