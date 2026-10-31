# The Swift iOS app

`AstraAntiqua/` is the SwiftUI app; `AstraCore/` is the chart maths, a Swift package that reads
`shared/content` and holds the parity tests. `AstraAntiqua.xcodeproj` is generated from `project.yml`
by XcodeGen and committed, so a Mac with Xcode opens and runs it with nothing else.

## 2026-10-31: build, test and capture screenshots

- Build: only on macOS. CI job `ios27-app` in `.github/workflows/swift.yml` builds the committed project
  with Xcode 27.1 for the simulator. On a Mac: open `AstraAntiqua.xcodeproj`, pick the `AstraAntiqua`
  scheme and an iPhone simulator, run.
- Test the core: CI job `core-linux` runs `swift test` in `AstraCore/`. On this Windows PC, under WSL:

  ```bash
  wsl.exe bash -lc 'cd "/mnt/l/Claude Projects/astra-antiqua/ios/AstraCore" && ~/.local/swift/swift-6.4.1-RELEASE-ubuntu26.04/usr/bin/swift test --scratch-path $HOME/astra-build'
  ```

  Use the checkout or worktree you work in for the path. Run it after every change to `AstraCore/`.
- Screenshots: `.github/scripts/ios-smoke.sh` boots a 390x844 iPhone (the glass canvas's frame; on the
  Xcode 27.1 runner that is the iPhone 17e on iOS 27.0, since iOS 27.1 offers only the iPhone Duo),
  installs the build and photographs every screen; a second pass photographs three chrome screens on the
  Duo into `smoke/duo/`. The app opens the screen named by
  `ASTRA_SCREEN` (`AstraAntiqua/ScreenshotMode.swift`); a new screen gets a case there and a `shot` line
  in the script. CI uploads the pictures as the `swift-ios27-screens` artifact.
- Placement: views of the glass design carry `.placement("P17")` and so on. In a screenshot run the app
  prints each one's frame; the job's last step, `.github/scripts/check-placement.py`, compares them with
  `placement/*.json` (the canvas tables) to within 1 pt and fails on a miss.
- Glass chrome captures: `chrome`, `chrome-scrolled`, `chrome-approx`, `chrome-pressed`, `chrome-pushed`,
  `chrome-pushed-pressed`.
- A new Swift file must be added to `project.yml`'s sources (the `AstraAntiqua` folder is picked up
  whole) and to the committed project: run `xcodegen generate` on a Mac, or add it to
  `project.pbxproj` by hand and commit the project CI regenerates.
