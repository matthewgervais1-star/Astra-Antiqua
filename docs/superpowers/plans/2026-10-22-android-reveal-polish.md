# Android script reveal polish (2026-10-22)

Spec: `docs/superpowers/specs/2026-10-20-script-reveal.md`, rules 3 to 5.

Source: the Task 3 review of the script reveal (Minors 3, 4 and 7, ledger
`.superpowers/sdd/2026-10-20-script-reveal/task-3-findings-r1.md`), deferred when PR #5 merged.
The owner chose them as the next stage on 2026-10-22.

## Global Constraints

- Web is canonical. Android's `ScriptName` mirrors `web/src/components/chrome/ScriptName.tsx`:
  a tap, or focus reaching the name's focusable ancestor (web listens for `focusin`), ends the
  intro and resolves the name until the next band crossing.
- No printed text changes, and no change to which names carry a script form.
- Timings come from the `ScriptReveal` constants (`FADE_MILLIS` 400, `INTRO_HOLD_MILLIS` 1200,
  `INTRO_STAGGER_MILLIS` 200). Screens add no new literal millisecond values.
- TalkBack semantics stay as ece6cf4 left them: `clearAndSetSemantics { text = AnnotatedString(latin) }`.
  `ScriptName` never becomes focusable itself, so no name adds a focus stop.
- Code comments match the density and voice of the file they sit in. No em dashes in comments
  or commit messages.
- Commits: `fix(android): <plain sentence>`, ending with the trailer
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `cd android && ./gradlew testDebugUnitTest` stays green (216 tests at 2f38e6e). If `java` is
  not on PATH, set `JAVA_HOME` to `C:/Program Files/Android/Android Studio/jbr`.

## Task 1: four deferred fixes in the Android script reveal

Files: `android/app/src/main/java/com/astra/antiqua/ui/components/ScriptName.kt`,
`.../domain/ScriptReveal.kt`, `.../ui/screens/CultureSelectionScreen.kt`, `.../MainActivity.kt`,
every screen or component whose `ScriptName` sits inside a clickable container (at least the
picker's `Panel` in `CultureSelectionScreen.kt` and the row in `VoicesScreen.kt`; check `DataRow`
in `ui/components/Instrument.kt` and `DeityRow` in `VoiceScreen.kt`), and tests under
`android/app/src/test`.

### A. No frame shows the wrong form (review Minor 3)

Today a name without the intro starts with `latinAlpha` at 1 and `inBand` null. A name first
measured outside the band draws a frame or two in Latin before it snaps to script.

Required: no frame shows the form the band would not show. Until the first position report,
draw neither layer (both alphas 0). From the first report on, show the band's form, snapped
without a fade. A blank first frame is acceptable; a Latin first frame is not. Intro names start
in script, as they do now. If you can show that a state written in `onGloballyPositioned` reaches
the same frame's draw, you may keep in-band names visible on the first frame instead; say which
you chose, and why, in the report.

### B. The animator scale is observed while the app runs (review Minor 4)

`rememberAnimationsOff` reads `Settings.Global.ANIMATOR_DURATION_SCALE` once per context.

Required: a change to that setting while the app runs reaches the names on screen without
leaving the screen, through a `ContentObserver` on
`Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE)`. At most one observer per
activity, never one per name: for example a `CompositionLocal` provided once, where the app
already provides its other locals, that `ScriptName` reads, with a read-once fallback when
nothing provides it (previews). The observer is unregistered on dispose.

### C. The picker's hold clears the phase fade (review Minor 7, first half)

`CultureSelectionScreen` composes when `MainActivity`'s `AnimatedContent` starts its 400 ms
fade-in (`FADE_MS`), so a third of the first name's 1.2 s hold passes under the fade.

Required: picker name `index` resolves at the phase fade plus `ScriptReveal.introDelayFor(index)`
after the picker first composes: 1600 ms for the first name, then 200 ms apart. One constant
holds the phase fade's length, shared by `MainActivity` and the picker, so the literal 400 for
it appears once. A JVM unit test pins the five picker delays: 1600, 1800, 2000, 2200, 2400.

### D. D-pad and keyboard focus resolve a name (review Minor 7, second half)

Required: when the focusable container a `ScriptName` sits in gains focus, the name resolves as
a tap does: the intro ends and Latin holds until the next crossing. `ScriptName` takes the
container's `InteractionSource` as an optional parameter and observes it with
`collectIsFocusedAsState`. Each clickable container that holds a `ScriptName` passes one
`MutableInteractionSource` to both its `clickable` and the name, and keeps the indication it
draws today. Wire every such site and list them in the report.

### Verification

- JVM tests for any logic moved into `ScriptReveal` or another pure function; C's delays at least.
- `./gradlew testDebugUnitTest` green, and `./gradlew compileDebugSources` clean.
- Emulator (AVD `Pixel_9`): install the debug build, capture with `adb exec-out screencap -p`
  into the workspace's `shots/` folder, and look at every shot before naming it in the report:
  1. B: a screen with names in script outside the band; then
     `adb shell settings put global animator_duration_scale 0` with no navigation, and a second
     shot shows them in Latin. Restore the setting to 1 afterwards and confirm it with
     `adb shell settings get global animator_duration_scale`.
  2. D: D-pad focus (`adb shell input keyevent KEYCODE_DPAD_DOWN`, repeated) on a row whose name
     sat outside the band in script; the shot shows that name resolved.
