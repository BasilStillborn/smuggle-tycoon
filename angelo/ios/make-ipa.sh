#!/usr/bin/env bash
# Release Candidate .ipa for Smuggle Tycoon (iOS) — run ON THE MAC.
#
#   bash angelo/ios/make-ipa.sh
#
# Signing team is auto-resolved by Xcode (-allowProvisioningUpdates).
# Override explicitly if needed:  TEAM_ID=ABCDE12345 bash angelo/ios/make-ipa.sh
#
# Output: angelo/ios/build/ipa/*.ipa
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"     # .../angelo/ios
ROOT="$(cd "$HERE/.." && pwd)"            # .../angelo
OUT="$HERE/build"

echo "==> 1/5 Installing JS deps"
cd "$ROOT" && npm ci

echo "==> 2/5 Building web assets"
npm run build

echo "==> 3/5 Syncing web build into the iOS project"
npx cap sync ios

TEAM_ARGS=()
if [ -n "${TEAM_ID:-}" ]; then TEAM_ARGS=(DEVELOPMENT_TEAM="$TEAM_ID"); fi

cd "$HERE/App"

echo "==> 4/5 Archiving (Release, arm64)"
xcodebuild -project App.xcodeproj -scheme App -configuration Release \
  -sdk iphoneos -destination 'generic/platform=iOS' \
  -archivePath "$OUT/SmuggleTycoon.xcarchive" \
  -allowProvisioningUpdates ${TEAM_ARGS[@]+"${TEAM_ARGS[@]}"} archive

echo "==> 5/5 Exporting .ipa"
xcodebuild -exportArchive \
  -archivePath "$OUT/SmuggleTycoon.xcarchive" \
  -exportOptionsPlist "$HERE/ExportOptions.plist" \
  -exportPath "$OUT/ipa" \
  -allowProvisioningUpdates

echo ""
echo "DONE -> $OUT/ipa"
ls -la "$OUT/ipa"
echo ""
echo "Install: open Xcode (ios/App/App.xcodeproj), Window > Devices and Simulators,"
echo "drag the .ipa onto the connected iPhone. First run needs: Settings > General >"
echo "VPN & Device Management > Trust."
