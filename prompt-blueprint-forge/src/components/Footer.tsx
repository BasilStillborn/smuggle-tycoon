import Link from "next/link";
import { NewsletterSignup } from "./NewsletterSignup";

export function Footer() {
  return (
    <footer className="border-t border-(--border) bg-(--background) mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                PB
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text">Prompt</span>
                <span className="text-(--foreground)">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-(--muted) max-w-md leading-relaxed mb-4">
              The premier marketplace for AI prompt chains and blueprints.
              Empowering creators and developers to build better AI interactions.
            </p>
            <div className="max-w-xs">
              <p className="text-xs font-medium text-(--muted) mb-2">Stay updated on new blueprints &amp; creator tips</p>
              <NewsletterSignup />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link href="/marketplace" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Marketplace</Link>
              <Link href="/create" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Sell Blueprints</Link>
              <Link href="/marketplace?category=cat_1" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Content Writing</Link>
              <Link href="/marketplace?category=cat_2" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Code Generation</Link>
              <Link href="/dashboard" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="/legal/tos" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Terms of Service</Link>
              <Link href="/legal/privacy" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Privacy Policy</Link>
              <Link href="/legal/refund" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Refund Policy</Link>
              <Link href="/help" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">Help Center</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-(--border) mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-(--muted)">
            &copy; {new Date().getFullYear()} Prompt Blueprint Forge. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-(--muted) hover:text-(--foreground) transition-colors" aria-label="Twitter/X">𝕏</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xs text-(--muted) hover:text-(--foreground) transition-colors" aria-label="LinkedIn">in</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-(--muted) hover:text-(--foreground) transition-colors" aria-label="GitHub">GH</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
