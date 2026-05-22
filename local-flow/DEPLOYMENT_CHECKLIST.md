# LocalFlow Hub — Deployment Checklist & Required Operator Actions

Generated: 13 May 2026

---

## ✅ ALL CODE IS COMPLETE — DOMAIN LOCKED TO localflowhub.com

The production build passes with zero errors. 44 static pages are ready.
Domain has been hardwired into all source files.
No further coding is required.

---

## 👤 REQUIRED OPERATOR ACTIONS (Physical & Legal)

These are actions that **cannot** be automated by AI. You must perform them manually.

### 1. Affiliate Links — 20 Tools Need Your Real Links
- [ ] Open `src/data/tools.json`
- [ ] Replace each `?ref=localflow` placeholder URL with your real affiliate tracking link
- [ ] See `AFFILIATE_LINKS_REPORT.md` for the full list of tools awaiting links
- [ ] Sign up for each tool's affiliate programme before launch

### 2. Set Environment Variables in Vercel Dashboard
- [ ] `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` — Google Analytics 4 property
- [ ] `MAILCHIMP_API_KEY=your-api-key-us1` — from Mailchimp account
- [ ] `MAILCHIMP_LIST_ID=your-audience-id` — from Mailchimp audience settings
- [ ] `GOOGLE_SHEETS_API_KEY=your-google-api-key` — from Google Cloud Console
- [ ] `NEXT_PUBLIC_SITE_URL=https://localflowhub.com` — canonical site URL

### 3. Deploy to Vercel
- [ ] Sign up for Vercel (free tier: vercel.com)
- [ ] Connect your Git repository or upload the build output
- [ ] Configure `localflowhub.com` domain in Vercel dashboard
- [ ] Set all 6 environment variables above
- [ ] Click **Deploy**

### 4. Configure Domain DNS
- [ ] Point `localflowhub.com` nameservers to Vercel
- [ ] Or add the required CNAME/ALIAS records in your DNS provider
- [ ] Wait for DNS propagation (can take up to 48 hours)

### 5. Write & Add Unique Content (Ongoing)
- [ ] Expand tool listings with original screenshots
- [ ] Write detailed tutorials based on your own workflow testing
- [ ] Create the lead magnet PDF ("Ultimate Starter Checklist") for email capture

---

## 🔧 Environment Variables Template

Create `.env.local` in the project root or set these in your hosting dashboard:

```env
# Required
NEXT_PUBLIC_SITE_URL=https://localflowhub.com

# Analytics (optional — leave empty to disable)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email (optional — leave empty to disable email capture)
MAILCHIMP_API_KEY=your-api-key-us1
MAILCHIMP_LIST_ID=your-audience-id

# Data (optional — leave empty to disable)
GOOGLE_SHEETS_API_KEY=your-google-api-key
```

---

## 🚀 How to Run Locally

```powershell
cd local-flow
npm install
npm run dev
```

Open http://localhost:3000

---

## 📊 Site Inventory

| Page | Route | Type |
|---|---|---|
| Homepage | `/` | Static |
| Tools Directory | `/tools` | Dynamic (filters) |
| Tool Detail (×20) | `/tools/[slug]` | Static (SSG) |
| Guides Listing | `/guides` | Static |
| Guide Detail (×11) | `/guides/[slug]` | Static (SSG) |
| Setup Dashboard | `/setup` | Static |
| Domain Config | `/setup/domain` | Client |
| Privacy Policy | `/legal/privacy` | Static |
| Terms of Service | `/legal/terms` | Static |
| Affiliate Disclosure | `/legal/affiliate-disclosure` | Static |
| Search API | `/api/search?q=` | Dynamic |
| Sitemap | `/sitemap.xml` | Static |
| Robots.txt | `/robots.txt` | Static |

---

## 💰 Passive Income Architecture

1. User searches for automation tools
2. User reads review/comparison on tool detail page
3. User clicks affiliate link → visits tool provider
4. If user signs up/purchases → **you earn commission**
5. Email capture form collects leads → future email marketing
6. No inventory, no customer support, no manual order processing

---

**Final note:** The entire website is structurally complete. Domain is locked to `localflowhub.com`. Your only remaining work is affiliate link setup, API keys, and clicking the deploy button — all human-led activities.
