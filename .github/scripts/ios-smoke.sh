#!/usr/bin/env bash
# Boots the newest iPhone simulator of one iOS major version, installs the
# Release simulator build, and photographs every screen. The app opens a
# named screen when the simulator passes ASTRA_SCREEN
# (dotnet/AstraAntiqua.App/ScreenshotMode.cs).
#
# A screen fails when its launch returns no process or the process has died
# by the time of its screenshot. Every failure is recorded with the
# simulator's log and any crash report, and the script fails at the end if
# there was one, after photographing every screen it can.
#
#   .github/scripts/ios-smoke.sh <path to the .app> <out dir> <iOS major, e.g. 27> [bundle id] [record path]
#
# The bundle id defaults to the .NET app's; the record path is where the app
# reads its birth record inside its data container (default
# Library/birth.v1.json, the .NET app's; the Swift app keeps it in
# "Library/Application Support/birth.v1.json").
set -uo pipefail

APP="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
mkdir -p "$2/logs"
OUT="$(cd "$2" && pwd)"   # absolute: the simulator resolves --stdout/--stderr itself
MAJOR="$3"
BUNDLE="${4:-com.astra.antiqua.ios}"
RECORD="${5:-Library/birth.v1.json}"
SEED="$(pwd)/dotnet/AstraAntiqua.Core.Tests/TestData/smoke-birth.v1.json"
FAILURES=()

# What was built: the bundle id, minimum OS, SDK and architecture.
{
  plutil -p "$APP/Info.plist" | grep -E "CFBundleIdentifier|MinimumOSVersion|DTPlatformVersion|DTSDKName|CFBundleExecutable"
  file "$APP/$(plutil -extract CFBundleExecutable raw "$APP/Info.plist")"
  codesign -dv "$APP" 2>&1 | head -5
} > "$OUT/logs/app.txt" 2>&1
cat "$OUT/logs/app.txt"

xcrun simctl list runtimes > "$OUT/logs/runtimes.txt"
cat "$OUT/logs/runtimes.txt"
UDID=$(xcrun simctl list devices available -j | MAJOR="$MAJOR" python3 -c '
import json, os, sys
major = os.environ["MAJOR"]
devices = json.load(sys.stdin)["devices"]
runtimes = sorted((k for k in devices if (".iOS-" + major + "-") in k and devices[k]),
                  key=lambda k: [int(x) for x in k.rsplit("iOS-", 1)[1].split("-")])
if not runtimes:
    sys.exit("no iOS " + major + " simulator on this runner")
phones = [d for d in devices[runtimes[-1]] if d["name"].startswith("iPhone")]
print(phones[0]["udid"])
print(runtimes[-1] + " " + phones[0]["name"], file=sys.stderr)
') || exit 1
echo "simulator: $UDID"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b || exit 1
xcrun simctl status_bar "$UDID" override --time "9:41" --batteryState charged --batteryLevel 100 || true
xcrun simctl install "$UDID" "$APP" || exit 1
xcrun simctl listapps "$UDID" | grep -A3 "$BUNDLE" > "$OUT/logs/installed.txt" || true

diagnose() {
  local name="$1"
  xcrun simctl spawn "$UDID" log show --last 3m --style compact \
    --predicate 'process CONTAINS[c] "AstraAntiqua" OR eventMessage CONTAINS[c] "com.astra.antiqua"' \
    > "$OUT/logs/$name.syslog.txt" 2>&1 || true
  find ~/Library/Logs/DiagnosticReports -name "AstraAntiqua*" -mmin -10 -exec cp {} "$OUT/logs/" \; 2>/dev/null || true
  echo "---- last simulator log lines for $name ----"
  tail -40 "$OUT/logs/$name.syslog.txt" || true
}

shot() {
  local name="$1" screen="$2" wait="$3"
  local line="" pid="" attempt
  for attempt in 1 2 3; do
    if line=$(SIMCTL_CHILD_ASTRA_SCREEN="$screen" xcrun simctl launch --terminate-running-process \
        --stdout="$OUT/logs/$name.out.txt" --stderr="$OUT/logs/$name.err.txt" "$UDID" "$BUNDLE" 2>"$OUT/logs/$name.launch.txt"); then
      pid="${line##*: }"
      break
    fi
    echo "launch attempt $attempt for $name failed: $(tr '\n' ' ' < "$OUT/logs/$name.launch.txt")"
    sleep 10
  done
  if [ -z "$pid" ]; then
    echo "FAIL: $name (screen '$screen') never launched"
    FAILURES+=("$name")
    diagnose "$name"
    return
  fi
  sleep "$wait"
  xcrun simctl io "$UDID" screenshot "$OUT/$name.png" >/dev/null 2>&1 || true
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "FAIL: $name (screen '$screen', pid $pid) was not running at its screenshot"
    FAILURES+=("$name")
    diagnose "$name"
  else
    echo "ok: $name"
  fi
}

# Before any record exists: the five doorways.
shot 01-doorways "" 25

# Seed the birth record where the app reads it, then read every screen
# against it.
DATA=$(xcrun simctl get_app_container "$UDID" "$BUNDLE" data) || DATA=""
if [ -n "$DATA" ]; then
  mkdir -p "$(dirname "$DATA/$RECORD")"
  cp "$SEED" "$DATA/$RECORD"
  echo "seeded $DATA/$RECORD"
else
  echo "FAIL: no data container to seed"
  FAILURES+=("seed")
fi

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
shot 11b-voice-carthage voice-carthage 8
shot 12-matrix matrix 8
shot 13-method method 8
shot 14-learn learn 8
shot 15-learn-aspects learn-aspects 8
shot 16-forecast forecast 30
shot 17-synastry synastry 8
shot 18-more more 8

if [ "${#FAILURES[@]}" -gt 0 ]; then
  echo "Failed screens on iOS $MAJOR: ${FAILURES[*]}"
  exit 1
fi
echo "Every screen launched and stayed up on iOS $MAJOR."
