# Manual Deployment Guide — Vercel (No Git Required)

## Phase I: Prepare Your Files

1. Open `C:\Users\a6lit\OneDrive\Documents\New folder\local-flow` in File Explorer
2. Select all items **except** `node_modules` and `.next` (you can leave them, Vercel ignores them)
3. Copy them into a new folder on your Desktop named `localflowhub-site`

Your folder should look like this:

```
localflowhub-site/
  .env.example
  next.config.js
  package.json
  package-lock.json
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  vercel.json
  public/
  scripts/
  src/
  AFFILIATE_LINKS_REPORT.md
  DEPLOYMENT_CHECKLIST.md
```

## Phase II: Upload to Vercel

1. Go to https://vercel.com/new
2. Click **"Upload Project"** (third tab next to "Import Git Repository")
3. Drag & drop your `localflowhub-site` folder onto the upload area —or— click to browse and select it
4. Vercel auto-detects **Next.js** as the framework — leave it as-is
5. Click **"Deploy"**

Vercel will:
- Read `package.json` → run `npm install`
- Run `node scripts/prebuild-check.js && next build`
- Output the static site to `.next`

## Phase III: Connect Your Domain

1. After deployment succeeds, go to **Project → Settings → Domains**
2. Enter `localflowhub.com` and click **Add**
3. Vercel will show a **TXT record value** — copy it
4. Go to **GoDaddy → DNS Management → Add TXT record**
5. Paste the value, save, wait 5–10 min
6. Back in Vercel, click **"Verify"**

## If the Build Fails

The prebuild check (`scripts/prebuild-check.js`) runs before every build. Common causes:

| Error | Fix |
|---|---|
| "No stale YOUR-DOMAIN" | Open `src/app/sitemap.ts` and `src/app/layout.tsx` — ensure they say `localflowhub.com` |
| Affiliate URL warnings | Open `src/data/tools.json` — replace `?ref=localflow` with real links (warnings only, build proceeds) |
| Missing env vars | Set them in Vercel → Project → Settings → Environment Variables |

## After Deployment

Set these env vars in **Vercel → Project → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://localflowhub.com` |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` (your GA4 ID) |
| `MAILCHIMP_API_KEY` | (from Mailchimp) |
| `MAILCHIMP_LIST_ID` | (from Mailchimp audience) |
| `GOOGLE_SHEETS_API_KEY` | (from Google Cloud Console) |

Then trigger a redeploy: **Deployments → ⋯ → Redeploy**
