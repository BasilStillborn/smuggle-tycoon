# Store Asset Sources

The current PWA icon source is `public/app-icon.svg`.

Before App Store / Google Play submission, create production PNG assets from the approved icon source:

- App Store icon: 1024x1024 PNG, no transparency.
- Android adaptive icon foreground/background.
- Splash/launch image for iOS and Android.

Recommended next command after final artwork is available:

```bash
npx @capacitor/assets generate --ios --android
```

Run this after adding the native platforms and before the final Codemagic release build.
