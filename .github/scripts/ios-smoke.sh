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
# The glass design is drawn on a 390x844 frame, so the screens are photographed
# on a phone of that size: the first of SMOKE_PHONES the newest runtime offers
# (an existing device, or one created from a supported type). Without one, the
# first iPhone that is not a foldable, and the placement check then reports the
# window it measured on. Every phone the runtime offers is logged in phones.txt.
# (2026-10-31: iOS 27.1 refuses the iPhone 16e as "Incompatible device", and its
# first iPhone, the iPhone Duo, saved no screenshot.)
PHONES="${SMOKE_PHONES:-iPhone 17e,iPhone 16e}"
xcrun simctl list runtimes -j > "$OUT/logs/runtimes.json"
PICK=$(xcrun simctl list devices available -j | MAJOR="$MAJOR" PHONES="$PHONES" RUNTIMES="$OUT/logs/runtimes.json" LOG="$OUT/logs/phones.txt" python3 -c '
import json, os, sys
major, prefs = os.environ["MAJOR"], [p.strip() for p in os.environ["PHONES"].split(",") if p.strip()]
devices = json.load(sys.stdin)["devices"]
keys = sorted((k for k in devices if (".iOS-" + major + "-") in k),
              key=lambda k: [int(x) for x in k.rsplit("iOS-", 1)[1].split("-")])
if not keys:
    sys.exit("no iOS " + major + " simulator on this runner")
runtime = keys[-1]
phones = [d for d in devices[runtime] if d["name"].startswith("iPhone")]
supported = []
for r in json.load(open(os.environ["RUNTIMES"]))["runtimes"]:
    if r.get("identifier") == runtime:
        supported = [t for t in r.get("supportedDeviceTypes", []) if t.get("productFamily") == "iPhone"]
with open(os.environ["LOG"], "w") as log:
    log.write("runtime " + runtime + "\n")
    log.write("devices: " + ", ".join(d["name"] for d in phones) + "\n")
    log.write("types: " + ", ".join(t["name"] for t in supported) + "\n")
duo = next((d["udid"] for d in phones if "Duo" in d["name"]), "-")
for pref in prefs:
    hit = [d for d in phones if d["name"] == pref]
    if hit:
        print("use", hit[0]["udid"], runtime, pref.replace(" ", "_"), duo); sys.exit()
    typ = [t for t in supported if t["name"] == pref]
    if typ:
        print("create", typ[0]["identifier"], runtime, pref.replace(" ", "_"), duo); sys.exit()
plain = [d for d in phones if not any(w in d["name"] for w in ("Duo", "Fold", "Flip"))] or phones
if not plain:
    sys.exit("no iPhone on " + runtime)
print("use", plain[0]["udid"], runtime, plain[0]["name"].replace(" ", "_"), duo)
') || exit 1
cat "$OUT/logs/phones.txt"
read -r ACTION ID RUNTIME NAME DUO <<< "$PICK"
NAME="${NAME//_/ }"
if [ "$ACTION" = "create" ]; then
  UDID=$(xcrun simctl create "$NAME" "$ID" "$RUNTIME" 2>"$OUT/logs/create.txt") \
    || { echo "could not create $NAME: $(tr '\n' ' ' < "$OUT/logs/create.txt")"; exit 1; }
else
  UDID="$ID"
fi
case ",$PHONES," in *",$NAME,"*) ;; *) echo "WARNING: none of $PHONES on $RUNTIME; photographing on $NAME, not 390x844" ;; esac
xcrun simctl list devices | grep "$UDID" | tee "$OUT/logs/device.txt"
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
  # A phone with two displays wants one named; the errors are kept.
  xcrun simctl io "$UDID" screenshot "$OUT/$name.png" >"$OUT/logs/$name.shot.txt" 2>&1 \
    || xcrun simctl io "$UDID" screenshot --display=internal "$OUT/$name.png" >>"$OUT/logs/$name.shot.txt" 2>&1 \
    || true
  if [ ! -s "$OUT/$name.png" ]; then
    echo "FAIL: $name has no screenshot: $(tr '\n' ' ' < "$OUT/logs/$name.shot.txt")"
    FAILURES+=("$name")
  fi
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

# The Liquid Glass chrome (Phase B, step 1): at rest, over a test pattern,
# the canvas approximation of the glass, the proposed pressed states, and a
# pushed screen. Each prints its placement for check-placement.py.
shot 20-chrome chrome 10
shot 21-chrome-scrolled chrome-scrolled 10
shot 22-chrome-approx chrome-approx 10
shot 23-chrome-pressed chrome-pressed 10
shot 24-chrome-pushed chrome-pushed 10
shot 25-chrome-pushed-pressed chrome-pushed-pressed 10

# The iPhone Duo (Matthew, 2026-10-31): no canvas board, so pictures only, in
# duo/ where check-placement.py does not look. Its failures are reported and do
# not fail the run.
if [ "$DUO" != "-" ] && [ "$DUO" != "$UDID" ]; then
  MAIN_UDID="$UDID"; MAIN_OUT="$OUT"; MAIN_FAILURES=(${FAILURES[@]+"${FAILURES[@]}"})
  UDID="$DUO"; OUT="$MAIN_OUT/duo"; FAILURES=()
  mkdir -p "$OUT/logs"
  xcrun simctl shutdown "$MAIN_UDID" || true
  xcrun simctl boot "$UDID" || true
  if xcrun simctl bootstatus "$UDID" -b && xcrun simctl install "$UDID" "$APP"; then
    xcrun simctl status_bar "$UDID" override --time "9:41" --batteryState charged --batteryLevel 100 || true
    shot 20-chrome chrome 10
    shot 21-chrome-scrolled chrome-scrolled 10
    shot 24-chrome-pushed chrome-pushed 10
  else
    FAILURES+=("boot or install")
  fi
  [ "${#FAILURES[@]}" -gt 0 ] && echo "WARNING: on the iPhone Duo: ${FAILURES[*]} (not counted)"
  UDID="$MAIN_UDID"; OUT="$MAIN_OUT"; FAILURES=(${MAIN_FAILURES[@]+"${MAIN_FAILURES[@]}"})
fi

if [ "${#FAILURES[@]}" -gt 0 ]; then
  echo "Failed screens on iOS $MAJOR: ${FAILURES[*]}"
  exit 1
fi
echo "Every screen launched and stayed up on iOS $MAJOR."
