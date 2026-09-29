# Android account sync

**Date:** 2026-09-29. **Owner's decision:** build sign-in, sign-up, sign-out and chart sync
on Android against the web API, plus account export and strike, and the wait list.

## The server, as it is

The contract is the web API at `web/src/app/api/**` (a full description was taken on
2026-09-29 and the facts below come from it). The session is a cookie named
`astra_session`, an HS256 JWT valid 30 days, issued only by `POST /api/auth/signup` and
`POST /api/auth/signin` through `Set-Cookie` (httpOnly, sameSite lax, path /, no domain;
`Secure` only in production without `ASTRA_ALLOW_HTTP=1`). No bearer header is read; the
cookie is the only credential. Writes check origin: if the client sends `Origin` or
`Referer`, its host must equal the `Host` header; if it sends neither, the check passes.
No CORS. Rate limits are per process.

Routes the client uses: `POST /api/auth/signup` `{ email, password, displayName? }`;
`POST /api/auth/signin` `{ email, password }`; `POST /api/auth/signout`;
`GET /api/auth/me` (always 200, `user` or null); `GET /api/charts` (`chart` or null);
`PUT /api/charts` `{ name, date, time, cityLabel, latitude, longitude }` (upsert, one chart
per account, server keeps its own `id` and `createdAt`); `DELETE /api/charts`;
`GET /api/me/export` (a JSON document with `user` and `chart`); `DELETE /api/me` (no
confirmation server-side); `POST /api/wait-list` `{ email, name?, pantheon?, background? }`
returning `position`. Error envelope `{ ok: false, error }`, wait-list validation adds
`fieldErrors`.

The web client's merge rule on sign-in: if the server has a chart, the server's copy
replaces the device's; otherwise the device's chart is uploaded. Saves mirror to the server
when signed in and ignore failures. Signout keeps the device chart.

## What Android builds

1. **A base URL.** `BuildConfig.API_ORIGIN`: debug builds default to `http://10.0.2.2:3000`
   (the emulator's alias for the host, where `pnpm dev` or `pnpm start:lan` serves the API
   with a non-Secure cookie); release builds take the deployed origin from
   `gradle.properties` (`astra.apiOrigin`), and the build fails if it is unset. Cleartext
   traffic is allowed for `10.0.2.2` only, through a network security config, never in
   release.
2. **A cookie session store.** The `astra_session` cookie value and its expiry, kept in
   encrypted DataStore (`androidx.security.crypto` or the DataStore encryption the app
   already uses for nothing yet; choose the smaller dependency and say why). The HTTP client
   (OkHttp, already transitively present or added as `com.squareup.okhttp3:okhttp`) sends the
   cookie on every request to the origin and stores it from `Set-Cookie` on signup and
   signin; it sends no `Origin` header, so the server's origin check passes by absence. A 401
   from a session-required route clears the store.
3. **An `AccountRepository` interface** with a real implementation over the client and a fake
   for tests: `signUp`, `signIn`, `signOut`, `me`, `getChart`, `putChart`, `deleteChart`,
   `export`, `strike`, `joinWaitList`. Errors surface as a sealed type carrying the server's
   `error` string and the status, never as exceptions on the UI thread.
4. **Sync of the one chart.** On sign-in and sign-up: the web rule (server wins when it has a
   chart; otherwise the device's `UserProfile` is uploaded). On every profile save while
   signed in: PUT, failures logged and ignored. On sign-out: the device profile stays. The
   mapping between `UserProfile` (date, time, city, lat, lon, zone) and `SavedChartInputs`
   (date, time, cityLabel, latitude, longitude) drops the zone on the way up and re-derives it
   on the way down as the web does, from latitude and longitude (`tz-lookup` on web; on Android
   the existing `EstimateZoneOffsetForLongitude` path or a bundled zone lookup; say which).
5. **Screens**, on the nave chassis the app already has: THE RECORD (sign-in / first entry,
   email and password, the honest microcopy from web's `/signin`), ACCOUNT (culture, YOUR
   CHART SYNCED / NOT CAST, SYNC ON/OFF badge, SIGN OUT, EXPORT THE RECORD, STRIKE THE RECORD
   with type-your-email-to-confirm as on web), THE ROLL (wait list with position line). Routes
   join `ui/nav/Destinations.kt`; the shell's account entry appears where web's lintel has it.
6. **Export** writes the JSON document to the app's cache and shares it through
   `ACTION_SEND` (a file, not a URL). **Strike** calls `DELETE /api/me`, clears the session,
   keeps the device chart, and returns to the culture-selection screen.
7. **Wait list** posts and shows `YOU ARE {nth} ON THE ROLL · WE EMAIL ONCE, WHEN CALLED`.

## Rules

- No account wall: every existing screen works signed out, exactly as now.
- The session is never logged, never in a toast, never in an exception message.
- The password field never autofills from the clipboard and is cleared on leaving the screen.
- Strings live in `res/values/strings.xml` (the app's French resources are a later task; the
  keys make that possible).
- ViewModels take the repository interface; every new ViewModel gets tests against the fake,
  in the harness `viewmodel/Fakes.kt` already provides.

## Verification

- JVM tests: the repository against a fake HTTP layer (sign-in stores the cookie; a 401
  clears it; PUT maps the profile; the merge rule; strike clears the session and keeps the
  profile); the three ViewModels against the fake repository.
- A manual pass on the emulator against `pnpm dev` with `DATABASE_URL` pointing at a PGlite
  or Neon branch: sign up, see the chart appear on the web account page, cast on the phone,
  see it replace the server's, sign out, sign in on a second emulator and receive the server
  chart. Record the pass in the report with screenshots.
- `./gradlew compileDebugSources testDebugUnitTest` green; `assembleRelease` still builds with
  `astra.apiOrigin` set to a placeholder origin.
