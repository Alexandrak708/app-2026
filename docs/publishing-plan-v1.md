# Final Security Sweep + Google Play Publishing Plan — UniApp (app-2026)

## Context

The app (Expo SDK 54 / RN 0.81, Supabase backend, en/bg i18n) has been prepared for Google Play over previous sessions (Phases 1–3: account deletion, password rules, privacy screen, eas.json, etc.). The user asked for a **final security sweep** and a **from-zero publishing plan**. Three parallel audits (secrets/config, auth/data security, Android/Play config) plus direct git-history verification were completed on 2026-07-04.

## Security sweep verdict

**PASSED (verified, no action needed):**
- No secrets in git — `.env.local` is untracked, ignored (`.gitignore:23`), and no JWT/key value appears anywhere in commit history (verified with `git log -S` + per-commit grep). Only `.env.example` is committed.
- `lib/supabase.ts` uses only the public `sb_publishable_` key; service-role key exists only in `.env.local` and `Deno.env.get()` in the Edge Function. Web bundle in `dist/` contains no server secrets.
- `supabase/functions/delete-account/index.ts` correctly validates the caller's JWT before deleting, deletes avatars → profile → auth user, only self-deletion possible.
- Password rules in `app/register.tsx`: 8+ chars, letter + number. No passwords logged.
- Session storage: AsyncStorage w/ autoRefresh (standard for Expo+Supabase).
- No `eval`, `dangerouslySetInnerHTML`, WebView, or unvalidated `Linking.openURL`. No fake security screens. Permissions are minimal (INTERNET + photo library via expo-image-picker only; no CAMERA).
- eas.json production profile builds AAB with `autoIncrement` — correct for Play.
- Expo SDK 54 targets Android API 36 — meets Play's target-API requirement.

**BLOCKERS found (fixed by this plan):**
1. `app.json:15` — placeholder package `com.yourcompany.app2026` (permanent once uploaded).
2. `support@example.com` ×4 — `app/locales/en.json:127,154`, `app/locales/bg.json:128,155`.
3. Placeholder Terms of Service text — `en.json:140`, `bg.json:141`.
4. About screen says "This is a demo application" — `en.json:136`, `bg.json:137`.
5. Supabase-side hardening not done yet (user confirmed): key rotation, RLS, Edge Function deployment, auth settings.

**User decisions (already made):**
- Package name: **`com.uniapp.bg2026`**
- Support email: **`uandi.app@gmail.com`**
- I draft real ToS (en+bg) + About text.

---

## Part 1 — Code fixes (implemented in this session)

1. **`app.json`**: `android.package` → `com.uniapp.bg2026`.
2. **`app/locales/en.json` + `app/locales/bg.json`**:
   - Replace all 4 `support@example.com` occurrences with `uandi.app@gmail.com`.
   - Replace `terms.description` placeholder with real structured ToS keys (acceptance, accounts & eligibility, acceptable use, university-info accuracy disclaimer, favourites/data, termination & deletion, liability limitation, changes to terms, contact) — Bulgarian translation mirrors English.
   - Replace `about.description` "demo application" text with a real app description (university discovery for Bulgarian universities, favourites, profiles).
   - Update `privacy.updated` / add ToS "last updated" to `2026-07-04`.
3. **`app/terms.tsx`**: restructure from single `<ThemedText>{t('terms.description')}</ThemedText>` to sectioned layout mirroring `app/privacy.tsx` (title + section headers + bodies).
4. **Error-log hygiene** (recommended-tier): in `app/(tabs)/settings.tsx` (lines ~154, 212, 237, 261, 274) and `app/profile.tsx` (~41, 60), log `error.message` only / guard with `if (__DEV__)` so raw Supabase error objects don't leak into production logs.
5. **Sanity pass**: run `npx tsc --noEmit` and `npm run lint` after edits (29 pre-existing lint warnings are non-blocking; don't chase them all).

## Part 2 — Supabase hardening (user does in dashboard; I provide exact steps + SQL)

Written as a checklist file `docs/play-store-launch.md` so it's tracked in the repo:

1. **Rotate the service-role key** (old one was exposed in earlier sessions): Dashboard → Settings → API → rotate `service_role`. Update `.env.local`. (Edge Functions get the new key automatically — it's injected at runtime.) Also rotate Gemini + Firecrawl keys if those were ever shared.
2. **RLS**: SQL to run in the SQL editor —
   - `alter table profiles enable row level security;`
   - Policies: select/update/insert own row (`auth.uid() = id`).
   - Storage `avatars` bucket policies: authenticated users read; insert/update/delete restricted to own folder (`(storage.foldername(name))[1] = auth.uid()::text`).
   - Verification query: attempt cross-user read with anon key.
3. **Deploy the delete-account function**: `npx supabase functions deploy delete-account --project-ref lkjhkabfxsqbejnecctr` (secrets auto-injected). Then test end-to-end from the app: create throwaway account → delete → confirm profile row, avatar object, and auth user are gone.
4. **Auth settings**: enable email confirmation; enable leaked-password protection; set server-side minimum password length to 8 (matches client).

## Part 3 — Publish to Google Play from zero (complete beginner walkthrough)

This full walkthrough is written into `docs/play-store-launch.md` so you can follow it at your own pace. It assumes no prior publishing knowledge. Steps 0–2 can run in parallel with Parts 1–2.

### Step 0 — Understand the pieces (5 min read)
- **Google Play Console** = the website where developers manage apps on the Play Store.
- **EAS (Expo Application Services)** = Expo's cloud build service. It turns your JS project into an **AAB** (Android App Bundle — the file format Google requires) without you installing Android Studio.
- **Signing keystore** = a cryptographic key proving app updates come from you. EAS creates and stores it for you — you never touch it.
- **Testing tracks** = Play releases go Internal → Closed → Production. New personal accounts MUST pass through Closed testing.

### Step 1 — Create your Google Play developer account (do this TODAY — verification takes days)
1. Go to https://play.google.com/console/signup while logged into the Google account that should own the app (can be `uandi.app@gmail.com` itself).
2. Choose **"Yourself"** (personal account) unless you have a registered company.
3. Pay the **$25 one-time fee** (any Visa/Mastercard).
4. Complete **identity verification** (upload ID document). Approval takes from hours to ~1 week.
5. ⚠️ Consequence of a personal account: before you can release to Production, Google requires a **closed test with ≥12 testers opted in for 14 continuous days** (reduced from 20 in 2025 — the Console shows the exact current requirement). Plan your timeline around these 2 weeks and start recruiting testers (friends/family with Gmail accounts) now.

### Step 2 — Set up EAS (15 min, one time)
1. Create a free account at https://expo.dev/signup (or log in if you have one).
2. In the project folder run:
   - `npm install -g eas-cli`
   - `eas login` (your expo.dev credentials)
   - `eas init` — links the project to your Expo account and writes `extra.eas.projectId` into app.json (currently missing; builds fail without it). Commit this change.

### Step 3 — Build the app (after Part 1 code fixes + Part 2 Supabase work are done)
1. Test build first: `eas build --platform android --profile preview` → produces an installable **APK**. Download the link EAS prints, install it on any Android phone (allow "install from unknown sources"), and click through the whole app: register (check the confirmation email arrives), login, favourites, avatar upload, language switch, privacy/terms screens, delete account.
2. When the first build asks *"Generate a new Android Keystore?"* → answer **Yes** (EAS stores it; losing a self-managed keystore = losing the app forever).
3. Production build: `eas build --platform android --profile production` → produces the **AAB** (~10–20 min in EAS cloud). Download it; this file goes to Google. Your `eas.json` auto-increments the version number on every production build, so future updates are the same one command.

### Step 4 — Prepare the assets Google requires (do while builds run)
- **App icon**: 512×512 PNG (export from `assets/images/icon.png`).
- **Feature graphic**: 1024×500 PNG banner (app name + tagline on a colored background is fine — Canva works).
- **Screenshots**: minimum 2, recommended 4–8 phone screenshots (take on the phone running the preview APK, or an emulator). Show: home/search, university details, favourites, profile.
- **Short description** (≤80 chars) and **full description** (≤4000 chars) — I can draft these in EN + BG during implementation.
- **Privacy policy URL** (mandatory): the web build already has a `/privacy` route — deploy the site to Vercel and use `https://<your-vercel-domain>/privacy`. This same URL doubles as the **account-deletion link** Play requires for apps with sign-up.

### Step 5 — Create the app in Play Console
1. Play Console → **All apps → Create app**.
2. Name: `UniApp` · language: English (or Bulgarian) · type: **App** · **Free**. Confirm declarations.
3. Note: **Free can never be changed to Paid** for the same app (in-app purchases would still be possible later).

### Step 6 — Fill in "App content" (Dashboard shows this as a task checklist — do them all)
| Section | What to answer for UniApp |
|---|---|
| Privacy policy | The Vercel `/privacy` URL |
| App access | "All functionality available without special access" is **wrong** — accounts exist. Choose "All or some functionality restricted" and provide a **test login** (create a dummy account for reviewers, e.g. reviewer@… + password) |
| Ads | No ads |
| Content rating | Fill questionnaire honestly (no violence/gambling/etc.) → gets ~Everyone/PEGI 3 |
| Target audience | 13+ (do NOT tick under-13 — triggers child-policy requirements) |
| News app | No |
| COVID-19 app | No |
| Data safety | Declares: **email + name** (App functionality/Account management, encrypted in transit, deletable), **photos** (optional, App functionality), account-deletion available in-app + via the privacy URL. I'll include the exact form answers in `docs/play-store-launch.md` |
| Government app | No |
| Financial features | None |

### Step 7 — First release: Internal testing (same day)
1. Play Console → **Testing → Internal testing → Create new release**.
2. When asked about signing, accept **Google Play App Signing** (default).
3. Upload the **AAB** from Step 3 (the very first upload MUST be manual through this web page — the `eas submit` command only works for later releases).
4. Release name auto-fills; write short release notes ("First release"); **Save → Review → Start rollout**.
5. Add your own Gmail to the internal testers list, open the opt-in link on your phone, and install from the Play Store — this proves the store-delivered build works.

### Step 8 — Closed testing (the mandatory 14 days)
1. **Testing → Closed testing → Create track/release** — promote the same build from Internal.
2. Add your ≥12 testers' Gmail addresses (or a Google Group), send them the opt-in link.
3. All 12+ must stay **opted in continuously for 14 days** (they should install the app and ideally open it a few times — Google watches for real engagement).
4. After 14 days, Play Console shows an **"Apply for production access"** button → answer the short questionnaire about your testing.
5. Production access approval usually takes ~a few days.

### Step 9 — Production release 🚀
1. **Production → Create new release** — promote the tested build (or upload a fresh AAB if you fixed things during testing).
2. Complete the **Store listing** (Step 4 assets) if not already done — it must be finished before production review.
3. **Start rollout to Production**. First-app review can take **up to 7 days** (usually 1–3). You'll get an email on approval/rejection; rejections state the policy violated and you can fix + resubmit.

### Step 10 — After launch
- Updates = bump nothing manually, just `eas build -p android --profile production`, then upload the new AAB (or configure `eas submit` with a Google Cloud service-account key for one-command submissions — optional, instructions in the docs file).
- Watch **Play Console → Ratings & Reviews** and the `uandi.app@gmail.com` inbox (Google sends policy notices there).
- Keep the Supabase service-role key secret forever; never commit `.env.local`.

## Verification

- `npx tsc --noEmit` and `npm run lint` pass (no new errors).
- `grep -r "example.com\|placeholder terms\|временни условия\|demo application\|демонстрационно" app/` returns nothing.
- `expo start` → check Terms, About, Help Center, Privacy screens render the new text in both en and bg.
- After user completes Part 2: end-to-end account-deletion test + cross-user RLS read test.
- Preview build (`eas build -p android --profile preview`) installs and runs on a device before the production AAB is built.

## Out of scope / noted only

- `pdf-parse`/`pdfjs-dist` remain in devDependencies (don't ship; optional cleanup).
- 29 pre-existing lint warnings (non-blocking).
- `GEMINI_API_KEY`/`FIRECRAWL_API_KEY` in `.env.local` are used by local scripts only, never bundled — rotate if ever shared, otherwise fine.