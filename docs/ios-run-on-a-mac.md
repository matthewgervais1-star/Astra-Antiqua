# Running the iOS app on a borrowed iMac, on iOS 27 (2026-10-21)

The iOS head (`dotnet/AstraAntiqua.App`) builds only on a Mac. These steps
run it in an iOS 27 iPhone simulator, and optionally on a real iPhone. They
take about an hour the first time, most of it downloads.

CI already does the same thing on every push: the `ios27` job in
`.github/workflows/ios.yml` builds against the iOS 27.1 SDK, boots an iOS 27
iPhone simulator and photographs every screen (the "ios27-screens" artifact
on the run's page). The iMac run is the check by a person.

## 1. Check the iMac first

Apple menu, About This Mac. Look at **Chip** (or **Processor**) and **macOS**.

| What it says | What it can do |
|--------------|----------------|
| Chip: Apple M1, M3, M4 (the 24-inch iMac, 2021 or later), macOS Tahoe 26.6 or later, or macOS 27 | Everything below, including the iOS 27 simulator. |
| Chip: Apple M-series, macOS older than Tahoe 26.6 | Update macOS first (System Settings, General, Software Update). |
| Processor: Intel (any iMac up to 2020) | **Cannot build for iOS 27.** Xcode 27 installs only on Apple silicon Macs. The 27-inch 2020 iMac can run Xcode 26.6 and the app, but only in iOS 26 simulators; installing on an iPhone running iOS 27 may work but Apple does not support it. Older Intel iMacs cannot run any Xcode 26. |

Sources: Apple's Xcode 27 and 27.1 release notes ("requires a Mac running
macOS Tahoe 26.6 or later"; "will only install and run on Apple silicon
Macs"), and Apple's macOS Tahoe compatibility list (support.apple.com/en-us/122867).

## 2. Install the tools (Apple silicon iMac)

.NET for iOS accepts only the Xcode its SDK was built for. These three go
together; the `ios27` CI job uses the same set.

| Tool | Version | Where |
|------|---------|-------|
| Xcode | 27.1 | Mac App Store (released 2026-10-15) |
| .NET SDK | 10.0.402 or a later 10.0.4xx | dotnet.microsoft.com/download/dotnet/10.0, the macOS Arm64 installer |
| MAUI workload | 10.0.402.1 | the command below |

Open Xcode once so it finishes installing its components. In Xcode,
Settings, Components, make sure an **iOS 27** simulator runtime is
installed. Then in Terminal:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

```bash
sudo dotnet workload install maui --version 10.0.402.1
```

```bash
dotnet workload --info
```

The last command should list `maui` and an iOS SDK `27.1.10018`. A build
that fails with "This version of .NET for iOS requires Xcode …" means Xcode
and the workload do not match; fix whichever is off.

## 3. Get the code onto the iMac

The repository is private. Pick one:

1. **A ZIP, no GitHub needed (simplest).** Matthew sends
   `Astra Antiqua iOS source 2026-10-21.zip` by AirDrop, Messages or a USB
   key. It holds only what the iOS build needs (`dotnet/`, `shared/content/`,
   the font files and this guide). Double-click it in Downloads, then in
   Terminal:

   ```bash
   cd ~/Downloads/"Astra Antiqua iOS source 2026-10-21"
   ```

2. **Your friend's own GitHub account.** On github.com, the repository's
   Settings, Collaborators, Add people: add the friend's username with read
   access. Once they accept the invitation, on the iMac:

   ```bash
   git clone --branch claude/ios-branch-parity-895dbc https://github.com/matthewgervais1-star/astra-antiqua.git
   ```

   Git asks for a username and password; GitHub wants a personal access
   token as the password, or install the GitHub CLI and run `gh auth login`
   first. Remove the collaborator afterwards.

3. **A short-lived token of Matthew's.** On github.com, Settings, Developer
   settings, Personal access tokens, Fine-grained: repository access "Only
   astra-antiqua", permission Contents read-only, expiry 7 days. Clone as
   in option 2 and paste the token when asked for the password. Afterwards,
   on the iMac open Keychain Access, search "github.com" and delete the
   entry, then revoke the token on github.com.

Every command below runs from the folder that holds `dotnet/`.

## 4. Run it on an iOS 27 simulator

List the simulators and copy the id of an iPhone under `-- iOS 27.x --`:

```bash
xcrun simctl list devices available
```

```bash
dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios "-p:_DeviceName=:v2:udid=PASTE-THE-ID-HERE"
```

The first build takes several minutes. The simulator opens and launches the
app.

## 5. Optional: run it on an iPhone with iOS 27

A free Apple ID is enough; the install expires after seven days.

1. In Xcode, Settings, Accounts, add the Apple ID.
2. In Xcode, create a throwaway iOS App project with the bundle identifier
   `com.astra.antiqua.ios`, choose the personal team under Signing, plug in
   the iPhone and run it once. This makes the provisioning profile.
3. On the iPhone, turn on Settings, Privacy & Security, Developer Mode, and
   trust the developer under General, VPN & Device Management when asked.
4. With the phone plugged in:

```bash
dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios -p:RuntimeIdentifier=ios-arm64
```

## 6. What to check, in order

1. **Onboarding.** Choose a culture, enter a birth from the city list, cast
   the chart. The day opens.
2. **Worldwide search.** More, Edit the birth, type a town that is not in
   the list, tap "Search everywhere". The place line should show a zone such
   as `Europe/Paris`, not "estimated".
3. **Glyphs.** More, The five voices, Carthage. All ten glyphs should be
   whole: Semes is a disc with six rays, Sakun a slanted staff with cross
   strokes. Then Egypt: Ra is a disc beside a hooked staff, Khonsu a disc in
   a crescent. Compare with `docs/design/system/assets/glyphs/`.
4. **Every tab.** Today, Horizons (W, S and Y), Transits (the long transits
   take a few seconds), Chart, More.
5. **Synastry.** More, Synastry, enter a second birth. Go back to More and
   open Synastry again: the second person should be gone.
6. **Delete.** More, Delete the record, confirm. The app returns to the
   doorways; quitting and reopening it should not bring the record back.

Write down anything that looks wrong with the screen name, and take a
screenshot (Cmd+S in the simulator saves one to the desktop).
