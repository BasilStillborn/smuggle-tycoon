# First Week in Britain

A mobile-first MVP for a UK arrival assistant inspired by the SinoGuide category: a practical first-week operating system for foreign visitors, students, and business travellers.

## What It Includes

- Personalised arrival form
- Just-landed checklist
- Heathrow and Gatwick guidance
- London transport and payment basics
- NHS, emergency, etiquette, and phrase cards
- Official source links
- Endpoint-ready waitlist form with local demo mode
- GA4-ready validation event tracking
- SEO content block for first-time London visitors
- Chinese Visitor Mode with Baidu Translate setup guidance
- Bilingual copyable phrase cards for Chinese visitors
- Recommended app checklist for Chinese first-time visitors

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment Variables

`.env.local` is configured for local testing and is ignored by git. Use these values locally and in Vercel:

```bash
VITE_WAITLIST_ENDPOINT=https://formspree.io/f/xkoajvew
VITE_WAITLIST_PROVIDER=formspree
VITE_ANALYTICS_PROVIDER=ga4
VITE_ANALYTICS_ID=G-F4SXKZPEBX
VITE_ANALYTICS_DEBUG=false
```

For local debugging, set `VITE_ANALYTICS_DEBUG=true` so validation events print in the browser console.

If `VITE_WAITLIST_ENDPOINT` is empty, the waitlist form stays in demo mode and does not send data.

Tracked events include:

- `hero_cta_clicked`
- `checklist_generated`
- `guide_action_clicked`
- `official_link_clicked`
- `seo_checklist_cta_clicked`
- `chinese_mode_enabled`
- `baidu_translate_card_viewed`
- `baidu_translate_clicked`
- `recommended_app_clicked`
- `phrase_copied`
- `china_payment_guide_clicked`
- `chinese_waitlist_submitted`
- `waitlist_submit_attempted`
- `waitlist_submit_success`
- `waitlist_submit_error`

## Deploy On Vercel

Use `first-week-britain` as the Vercel project root directory.

Build settings:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Add the environment variables above in Vercel Project Settings before deploying.

After deploying, submit a test waitlist email and confirm Formspree receives the profile fields, including `visitor_segment` and `chinese_mode_enabled`.

## Next Product Steps

- Add Chinese-language content
- Add more UK airports and cities
- Replace partner placeholders with vetted affiliate offers
- Create three ad/SEO variants: first-time London, just landed in Britain, UK arrival checklist
- Create Chinese ad/SEO variants: 第一次去英国旅游, 中国游客英国支付, 英国地铁怎么坐, 英国旅游翻译软件
