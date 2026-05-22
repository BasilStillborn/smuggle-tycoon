import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SearchBar from "@/components/SearchBar";
import TrustBar from "@/components/TrustBar";

export const metadata: Metadata = {
  title: {
    default: "LocalFlow — Automate Your Marketing. Focus on Your Craft.",
    template: "%s | LocalFlow",
  },
  description:
    "Step-by-step automation guides built for busy local business owners. Save hours every week without hiring a tech team.",
  metadataBase: new URL("https://localflowhub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LocalFlow — Automation for Local Business Owners",
    description:
      "Step-by-step automation guides built for busy local business owners.",
    type: "website",
    siteName: "LocalFlow",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalFlow — Automation for Local Business Owners",
    description:
      "Step-by-step automation guides built for busy local business owners.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "impact-site-verification": "bb749fa7-e5fd-4b91-bfa5-f3457a095590",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-body">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="max-w-6xl mx-auto container-padding h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">LF</span>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">
                LocalFlow
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/tools" className="hover:text-brand-600 transition-colors">
                All Tools
              </Link>
              <Link href="/guides" className="hover:text-brand-600 transition-colors">
                Guides
              </Link>
            </nav>
            <div className="flex-1 max-w-sm hidden sm:block">
              <SearchBar />
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto container-padding py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">LocalFlow</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/tools" className="hover:text-brand-600">All Tools</Link></li>
                  <li><Link href="/guides" className="hover:text-brand-600">Guides</Link></li>
                  <li><Link href="/checklist" className="hover:text-brand-600">Free Checklist</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/tools?category=social-media" className="hover:text-brand-600">Social Media</Link></li>
                  <li><Link href="/tools?category=email-marketing" className="hover:text-brand-600">Email Marketing</Link></li>
                  <li><Link href="/tools?category=crm" className="hover:text-brand-600">CRM & Sales</Link></li>
                  <li><Link href="/tools?category=booking" className="hover:text-brand-600">Booking</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/checklist" className="hover:text-brand-600">Reputation Checklist</Link></li>
                  <li><Link href="/guides" className="hover:text-brand-600">Beginner Guides</Link></li>
                  <li><Link href="/setup" className="hover:text-brand-600">Site Setup</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/legal/affiliate-disclosure" className="hover:text-brand-600">Affiliate Disclosure</Link></li>
                  <li><Link href="/legal/privacy" className="hover:text-brand-600">Privacy Policy</Link></li>
                  <li><Link href="/legal/terms" className="hover:text-brand-600">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>LocalFlow — Automate your marketing. Focus on your craft.</p>
              <p className="mt-1">We earn from qualifying purchases via affiliate links. | &copy; {new Date().getFullYear()} LocalFlow</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
