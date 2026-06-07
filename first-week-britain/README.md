# UK Arrival Kit

A Chinese-first Britain arrival toolbox for translation, GBP/CNY currency estimates, UK payments, airport transfer, London transport, food delivery, taxi safety, emergency help, app links, and practical English phrases.

## What It Includes

- Chinese-first dashboard on `/` and `/zh`
- English/general fallback on `/en`
- Top-bar quick Chinese-to-English translation action
- Just-landed toolbox checklist
- Live GBP/CNY converter with cached/fallback rate
- Heathrow and Gatwick guidance
- London transport and payment basics
- Food delivery and taxi/ride-hailing app launchers
- NHS, emergency, etiquette, and phrase cards
- Feedback-aware waitlist form with Formspree endpoint support
- GA4-ready validation event tracking
- Capacitor config for iOS/Android packaging
- Codemagic cloud build starter config
- Privacy, Support, and Disclaimer pages for store submissions

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run native:sync
npm run native:android
npm run native:ios
```

`native:*` commands require the relevant Capacitor native platform directory. The Codemagic workflow can generate these directories in cloud builds.

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
- `quick_translate_opened`
- `quick_translate_google_clicked`
- `quick_translate_baidu_clicked`
- `feedback_option_selected`
- `currency_rate_loaded`
- `tool_app_clicked`

## Deploy On Vercel

Use `first-week-britain` as the Vercel project root directory.

Build settings:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Add the environment variables above in Vercel Project Settings before deploying.

After deploying, submit a test waitlist email and confirm Formspree receives the profile fields, including `visitor_segment` and `chinese_mode_enabled`.

## Native Store Builds

This app uses Capacitor for native packaging:

- App name: `UK Arrival Kit`
- Bundle/package ID: `app.ukarrivalkit.mobile`
- Web output directory: `dist`
- Cloud build config: `../codemagic.yaml`

Before App Store / Google Play submission, create:

- Apple Developer Program account
- App Store Connect app record
- Google Play Console account
- Google Play app record
- Codemagic signing integrations and secrets
- Production PNG icon/splash assets

See `STORE_RELEASE_CHECKLIST.md` for listing copy, screenshot requirements, legal URLs, and QA checklist.

## Next Product Steps

- Configure Apple/Google/Codemagic signing
- Generate production PNG icon and splash assets
- Build Android internal testing release
- Build iOS TestFlight release
- Capture store screenshots from native builds
- Run one focused feature build after validation data picks the winner
