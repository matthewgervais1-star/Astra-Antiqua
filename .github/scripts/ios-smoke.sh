#!/usr/bin/env bash
# Boots the newest iOS 27 iPhone simulator, installs the Release simulator
# build, and photographs every screen. The app opens a named screen when the
# simulator passes ASTRA_SCREEN (dotnet/AstraAntiqua.App/ScreenshotMode.cs).
# A screen whose process has died by the time of its screenshot is a crash;
# the script records every crash and fails at the end if there was one.
#
#   .github/scripts/ios-smoke.sh <path to AstraAntiqua.App.app> <out dir>
set -euo pipefail

APP="$1"
OUT="$2"
BUNDLE="com.astra.antiqua.ios"
SEED="dotnet/AstraAntiqua.Core.Tests/TestData/smoke-birth.v1.json"
mkdir -p "$OUT/logs"

xcrun simctl list runtimes | tee "$OUT/logs/runtimes.txt"
UDID=$(xcrun simctl list devices available -j | python3 -c '
import json, sys
devices = json.load(sys.stdin)["devices"]
runtimes = sorted((k for k in devices if ".iOS-27" in k), key=lambda k: [int(x) for x in k.rsplit("iOS-", 1)[1].split("-")])
if not runtimes:
    sys.exit("no iOS 27 simulator runtime on this runner")
phones = [d for d in devices[runtimes[-1]] if d["name"].startswith("iPhone")]
print(phones[0]["udid"])
print(runtimes[-1] + " " + phones[0]["name"], file=sys.stderr)
')
echo "simulator: $UDID"
xcrun simctl boot "$UDID"
xcrun simctl bootstatus "$UDID" -b
xcrun simctl status_bar "$UDID" override --time "9:41" --batteryState charged --batteryLevel 100 || true
xcrun simctl install "$UDID" "$APP"

CRASHES=()

shot() {
  local name="$1" screen="$2" wait="$3"
  local line pid
  line=$(SIMCTL_CHILD_ASTRA_SCREEN="$screen" xcrun simctl launch --terminate-running-process \
    --stdout="$OUT/logs/$name.out.txt" --stderr="$OUT/logs/$name.err.txt" "$UDID" "$BUNDLE")
  pid="${line##*: }"
  sleep "$wait"
  xcrun simctl io "$UDID" screenshot "$OUT/$name.png" >/dev/null
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "CRASH: $name (screen '$screen', pid $pid)"
    CRASHES+=("$name")
  else
    echo "ok: $name"
  fi
}

# Before any record exists: the five doorways.
shot 01-doorways "" 20

# Seed the birth record where the app reads it (FileSystem.AppDataDirectory,
# which is Library on iOS), then read every screen against it.
DATA=$(xcrun simctl get_app_container "$UDID" "$BUNDLE" data)
mkdir -p "$DATA/Library"
cp "$SEED" "$DATA/Library/birth.v1.json"

shot 02-day "" 15
shot 03-week week 10
shot 04-season season 12
shot 05-year year 15
shot 06-transits transits 30
shot 07-chart chart 8
shot 08-placement-sun placement-sun 8
shot 09-voices voices 8
shot 10-voice-egypt voice-egypt 8
shot 11-voice-canaan voice-canaan 8
shot 12-matrix matrix 8
shot 13-method method 8
shot 14-learn learn 8
shot 15-learn-aspects learn-aspects 8
shot 16-forecast forecast 30
shot 17-synastry synastry 8
shot 18-more more 8

find ~/Library/Logs/DiagnosticReports -name "AstraAntiqua*" -newer "$APP" -exec cp {} "$OUT/logs/" \; 2>/dev/null || true

if [ "${#CRASHES[@]}" -gt 0 ]; then
  echo "Crashed screens: ${CRASHES[*]}"
  exit 1
fi
echo "Every screen launched and stayed up on iOS 27."
