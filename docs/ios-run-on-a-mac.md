# Running the iOS app on a borrowed iMac, on iOS 27 (2026-10-21)

The native iOS app is Swift and SwiftUI (`ios/AstraAntiqua.xcodeproj`, on the
`ios/AstraCore` package). It needs **Xcode and nothing else**: no .NET, no
Homebrew, no command line. These steps run it in an iOS 27 iPhone simulator,
and optionally on a real iPhone.

CI already does the same on every push: the `ios27-app` job in
`.github/workflows/swift.yml` builds this exact project with Xcode 27.1,
boots an iOS 27 iPhone simulator and photographs every screen (the
"swift-ios27-screens" artifact on the run's page). The iMac run is the check
by a person.

## 1. Check the iMac

Apple menu, About This Mac. Look at **Chip** (or **Processor**) and **macOS**.

| What it says | What it can do |
|--------------|----------------|
| Chip: Apple M1, M3, M4 (the 24-inch iMac, 2021 or later), macOS Tahoe 26.6 or later, or macOS 27 | Everything below, including the iOS 27 simulator. |
| Chip: Apple M-series, macOS older than Tahoe 26.6 | Update macOS first (System Settings, General, Software Update). |
| Processor: Intel (any iMac up to 2020) | **Cannot build for iOS 27.** Xcode 27 installs only on Apple silicon Macs. |

Sources: Apple's Xcode 27 and 27.1 release notes ("requires a Mac running
macOS Tahoe 26.6 or later"; "will only install and run on Apple silicon
Macs") and Apple's macOS Tahoe compatibility list (support.apple.com/en-us/122867).

Leave room on the disk: Xcode 27.1 and its iOS 27 simulator are large
(plan for about 40 GB free; an estimate, not Apple's figure).

## 2. Install Xcode 27.1

From the Mac App Store (released 2026-10-15). Open it once and let it
finish installing its components. In Xcode, Settings, Components, make sure
an **iOS 27** simulator runtime is installed.

## 3. Get the code onto the iMac

The repository is private. Pick one:

1. **A ZIP, no GitHub needed (simplest).** Matthew sends
   `Astra Antiqua iOS app 2026-10-21.zip` by AirDrop, Messages or a USB key.
   It holds only what the app needs. Double-click it in Downloads.

2. **Your friend's own GitHub account.** On github.com, the repository's
   Settings, Collaborators, Add people: add the friend's username with read
   access. Once they accept, in Xcode choose Integrate, Clone, sign in to
   GitHub, pick `astra-antiqua` and switch to the branch
   `claude/ios-branch-parity-895dbc`. Remove the collaborator afterwards.

3. **A short-lived token of Matthew's.** On github.com, Settings, Developer
   settings, Personal access tokens, Fine-grained: repository access "Only
   astra-antiqua", permission Contents read-only, expiry 7 days. In Xcode,
   Integrate, Clone, paste
   `https://github.com/matthewgervais1-star/astra-antiqua.git`, give the token
   as the password, then switch to the branch above. Afterwards remove the
   GitHub account from Xcode, Settings, Accounts, and revoke the token.

## 4. Run it on an iOS 27 simulator

1. In the code folder, open `ios`, then double-click `AstraAntiqua.xcodeproj`.
2. Wait a few seconds while Xcode reads the `AstraCore` package (it is in
   the folder; nothing is downloaded).
3. At the top of the window, next to `AstraAntiqua`, choose an iPhone that
   says **iOS 27**.
4. Press Run (the ▶ button, or Cmd+R).

The first build takes a minute or two. The simulator opens and launches the
app on the five doorways.

## 5. Optional: run it on an iPhone with iOS 27

A free Apple ID is enough; the install expires after seven days.

1. In Xcode, Settings, Accounts, add the Apple ID.
2. Click the blue `AstraAntiqua` project at the top of the file list, then
   the `AstraAntiqua` target, then **Signing & Capabilities**. Tick
   "Automatically manage signing" and choose the personal team. If Xcode says
   the bundle identifier is taken, change `com.astra.antiqua.swift` to
   something of your own, such as `com.yourname.astra`.
3. On the iPhone, turn on Settings, Privacy & Security, Developer Mode, and
   trust the developer under General, VPN & Device Management when asked.
4. Plug in the iPhone, choose it at the top of the window, and press Run.

## 6. What to check, in order

1. **Onboarding.** Choose a culture, enter a birth from the city list, cast
   the chart. The day opens.
2. **Worldwide search.** More, Edit the birth, type a town that is not in
   the list, tap "Search everywhere". The place line should show a zone such
   as `Europe/Paris`, not "estimated".
3. **Glyphs.** More, The five voices, Carthage. All ten glyphs should be
   whole: Semes is a disc with rays, Sakun a slanted staff with cross
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

## Appendix: the .NET MAUI version

The repository also holds the earlier iOS head in C# and .NET MAUI
(`dotnet/AstraAntiqua.App`), which shows the same screens. It is not needed
to run the app. Building it needs Xcode 27.1 plus the .NET SDK 10.0.402 and
`sudo dotnet workload install maui --version 10.0.402.1`, then
`dotnet build dotnet/AstraAntiqua.App/AstraAntiqua.App.csproj -t:Run -f net10.0-ios`.
