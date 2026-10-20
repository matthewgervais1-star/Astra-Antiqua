# Running the iOS app on a Mac (2026-10-20)

The iOS head (`dotnet/AstraAntiqua.App`) builds only on macOS. These steps
run it in the iPhone simulator, and optionally on a real iPhone, from a
borrowed Mac. They take about an hour the first time, most of it downloads.

## 1. Install the tools, matched to each other

.NET for iOS accepts only the Xcode its SDK was built for. The pair below is
the one CI builds with (`.github/workflows/ios.yml`); a different Xcode fails
with "This version of .NET for iOS requires Xcode …".

| Tool | Version | Where |
|------|---------|-------|
| Xcode | 26.6 | Mac App Store, or developer.apple.com/download/all if the store offers a newer one |
| .NET SDK | 10.0 (latest 10.0.4xx) | dotnet.microsoft.com/download/dotnet/10.0 |
| MAUI workload | 10.0.401 | the command below |

Open Xcode once so it installs its components and an iOS simulator, then in
Terminal:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

```bash
sudo dotnet workload install maui --version 10.0.401
```

## 2. Get the code

```bash
git clone https://github.com/matthewgervais1-star/astra-antiqua.git
```

```bash
cd astra-antiqua && git checkout claude/ios-branch-parity-895dbc
```

The repository is private: sign in to GitHub on that Mac (for example with
`gh auth login`) or copy the folder over on a USB key.

## 3. Run it in the simulator

```bash
dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios
```

The first build takes several minutes. The simulator opens and launches the
app. To pick a particular phone, list the simulators and pass one's id:

```bash
xcrun simctl list devices available
```

```bash
dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios "-p:_DeviceName=:v2:udid=PASTE-THE-ID-HERE"
```

## 4. Optional: run it on your own iPhone

A free Apple ID is enough; the install expires after seven days.

1. In Xcode, Settings, Accounts, add your Apple ID.
2. In Xcode, create a throwaway iOS App project with the bundle identifier
   `com.astra.antiqua.ios`, choose your personal team under Signing, plug in
   the iPhone and run it once. This makes the provisioning profile.
3. On the iPhone, turn on Settings, Privacy & Security, Developer Mode, and
   trust the developer under General, VPN & Device Management when asked.
4. Build and install from Terminal, with the phone plugged in:

```bash
dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios -p:RuntimeIdentifier=ios-arm64
```

## 5. What to check, in order

1. **Onboarding.** Choose a culture, enter a birth from the city list, cast
   the chart. The day opens.
2. **Worldwide search.** Edit the birth (More, Edit the birth), type a town
   that is not in the list, tap "Search everywhere". The place line should
   show an IANA zone (for example `Europe/Paris`), not "estimated".
3. **Glyphs drawn with arcs.** More, The five voices, Egypt. Ra, Khonsu, Horus the Red, Geb, Nut, Nun and Osiris all use arcs.
   Compare them with the SVGs in `docs/design/system/assets/glyphs/egypt/`.
   A missing or flattened circle is a renderer bug to report.
4. **Every tab.** Today, Horizons (W, S and Y), Transits (the long transits
   take a few seconds), Chart, More.
5. **Synastry.** More, Synastry, enter a second birth. Go back to More and
   open Synastry again: the second person should be gone.
6. **Delete.** More, Delete the record, confirm. The app returns to the
   doorways; reopening it should not bring the record back.

Write down anything that looks wrong with the screen name, and take a
screenshot (Cmd+S in the simulator saves one to the desktop).
