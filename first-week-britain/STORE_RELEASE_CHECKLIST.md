# UK Arrival Kit Store Release Checklist

## App Identity

- Store name: UK Arrival Kit
- Chinese display name: 英国到达工具箱
- Bundle/package ID: app.ukarrivalkit.mobile
- Category: Travel
- Age rating: 4+ / Everyone
- Primary audience: Chinese visitors arriving in Britain

## Store Listing Draft

### Subtitle

Chinese-first Britain arrival tools.

### Short Description

Translation, GBP/CNY, UK payments, transport, delivery, taxis, and emergency help for Chinese visitors arriving in Britain.

### Full Description

UK Arrival Kit helps Chinese visitors handle the first week in Britain without searching across dozens of apps and websites.

Use it for quick Chinese-to-English translation, GBP/CNY estimates, UK payment guidance, airport-to-city basics, London transport apps, food delivery apps, taxi and ride-hailing safety, common English phrases, and emergency numbers.

The app is independent and is not an official UK government service. External tools such as Google Translate, Baidu Translate, TfL, Citymapper, National Rail, Deliveroo, Uber Eats, Just Eat, Uber, Bolt, and Met Office are linked for convenience and are operated by their own providers.

### Keywords

UK travel, Britain arrival, Chinese tourists, London travel, Heathrow, Gatwick, UK payments, GBP CNY, translation, TfL, Citymapper, Deliveroo, Uber, emergency 999, 英国旅游, 中国游客, 英国支付, 英镑人民币, 英国翻译, 希思罗, 盖特威克

## Required Public URLs

- Privacy Policy: https://first-week-britain.vercel.app/privacy.html
- Support: https://first-week-britain.vercel.app/support.html
- Disclaimer: https://first-week-britain.vercel.app/disclaimer.html

## Accounts To Create

- Apple Developer Program account
- App Store Connect app record
- Google Play Console account
- Google Play app record
- Codemagic account connected to this GitHub repository

## Codemagic Secrets To Configure

### Android

- `uk_arrival_kit_keystore` Android signing identity in Codemagic
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` service account credentials
- Codemagic group: `google_play_credentials`

### iOS

- Codemagic App Store Connect integration named `UK Arrival Kit App Store Connect`
- Bundle ID: `app.ukarrivalkit.mobile`
- Automatic or uploaded iOS signing certificate/profile for App Store distribution

## Screenshots Needed

Capture real-device or simulator screenshots showing:

- Chinese toolbox dashboard
- Top `译成英文` quick translation window
- GBP/CNY converter
- UK payment guidance
- Transport app launcher
- Food delivery app launcher
- Taxi/ride-hailing guidance
- Emergency help window

## Store Review Notes

Suggested note:

UK Arrival Kit is a locally bundled Capacitor app, not a remote website wrapper. It provides practical travel utilities for Chinese visitors arriving in Britain, including quick translation, cached currency estimates, app launch links, payment guidance, transport guidance, food delivery guidance, taxi safety guidance, common phrases, emergency numbers, and feedback collection.

The app is independent and is not an official UK government service. Translation text typed into the quick translator is not stored by the app. If a user opens Google Translate or Baidu Translate, that external service handles the translation.

## Pre-Submission QA

- Test `/`, `/zh`, and `/en` in the web build.
- Test iOS TestFlight build on a real iPhone.
- Test Android internal testing build on a real Android device.
- Verify top `译成英文` button.
- Verify external links open in the system browser from native builds.
- Verify Formspree waitlist submission.
- Verify feedback option payload.
- Verify GA4 events.
- Verify GBP/CNY live rate and fallback message.
- Verify legal links open.
- Verify no content is hidden under the notch or home indicator.
