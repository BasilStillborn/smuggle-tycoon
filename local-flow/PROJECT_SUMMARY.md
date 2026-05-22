# LocalFlow Hub — Project Summary

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Static generation (SSG) for all content pages
- Hosted on Vercel (free tier)

## Domain
- `localflowhub.com` — registered at GoDaddy, DNS managed at GoDaddy (nameservers reverted from Vercel)
- Vercel alias: `local-flow-eight.vercel.app` (currently working)
- A record: `@` → `216.198.79.1` (set in GoDaddy, pending propagation)
- TXT record: may be needed from Vercel dashboard when adding domain

## Key Architecture

### Pages (44 total)
| Route | Type | Description |
|---|---|---|
| `/` | Static | Homepage with hero, categories, popular tools, CTA |
| `/tools` | Client (Suspense) | Tool directory with sidebar filters, modal on card click |
| `/tools/[slug]` | SSG | Individual tool detail pages |
| `/guides` | Static | Guides listing |
| `/guides/[slug]` | SSG | Individual guide detail pages |
| `/setup` | Static | Env var configuration dashboard |
| `/setup/domain` | Client | DNS record generator (Vercel only) |
| `/legal/*` | Static | Privacy, Terms, Affiliate Disclosure |
| `/sitemap.xml` | Static | Dynamic sitemap |

### Data Files
- `src/data/tools.json` — 20 tools with affiliate_url, pricing, pros/cons, features, ratings
- `src/data/guides.json` — 11 guides with body HTML content
- `src/data/categories.json` — 9 categories

### Components
- `ToolCard` — Client component, shows tool summary, click opens modal
- `ToolModal` — Full-screen overlay with tool details + affiliate CTA button
- `HeroButtons` — Homepage: "Browse Guides" → /guides, "Download Checklist" → modal
- `ChecklistModal` — Email capture modal (name + email)
- `SidebarFilter` — URL-based category/difficulty filtering
- `CTABanner` — Inline email capture form
- `ComparisonTable` — Side-by-side tool comparison
- `InlineCTA` — In-content affiliate link
- `Breadcrumbs`, `TrustBar`, `SearchBar`

### Internationalization (i18n) — Placeholder Infrastructure
- `src/lib/i18n.ts` — Locale detection from `Accept-Language` header, supports en/es/fr/de
- `src/locales/{en,es,fr,de}.json` — Empty locale files ready for translation keys
- Middleware silently detects user locale and sets a `locale` cookie (non-English only)
- No visible behavior changes; ready for `/[locale]/` route structure when needed

### Middleware (`src/middleware.ts`)
- Allows `.vercel.app` preview URLs through
- Redirects all other non-canonical hosts → `localflowhub.com` (308)
- Silently detects and stores user locale via cookie

### Redirects (`next.config.js`)
- `www.localflowhub.com` → `localflowhub.com`
- Strip `index.html`, `.html` extensions
- Trailing slash normalization

### Prebuild Check (`scripts/prebuild-check.js`)
- Validates domain references across source files
- Reports affiliate link placeholder status
- Checks environment variable configuration
- Blocks build on domain reference errors

## Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://localflowhub.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
MAILCHIMP_API_KEY=your-api-key-us1
MAILCHIMP_LIST_ID=your-audience-id
GOOGLE_SHEETS_API_KEY=your-google-api-key
```

## Affiliate Links
All 20 URLs in `src/data/tools.json` use `?ref=localflow` placeholders. Replace with real affiliate links before launch.

## Deployment
```powershell
vercel --prod
```
Build runs `node scripts/prebuild-check.js && next build`.

## DNS Status (as of last session)
- GoDaddy nameservers: `ns25.domaincontrol.com` / `ns26.domaincontrol.com` (default GoDaddy)
- A record added: `@` → `216.198.79.1`
- Vercel dashboard shows domain as "Invalid Configuration" — waiting for A record propagation
- Working URL: `https://local-flow-eight.vercel.app`
