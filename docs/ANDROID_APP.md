# Building the GEO Loan.pk Android App (TWA)

The Android app is a **TWA (Trusted Web Activity)** — it wraps the live HTTPS website
into an installable Android app using **Bubblewrap**. You build an `.apk`, then upload it
in **Admin → Settings → Mobile App**, and the home page **"Download App"** button serves it.

Everything the web side needs is already in this repo:

- ✅ Web manifest at `/manifest.webmanifest` (`src/app/manifest.ts`)
- ✅ Icons: `/icon-192.png`, `/icon.png` (512)
- ✅ Digital Asset Links template at `/.well-known/assetlinks.json`

---

## Prerequisites

1. **Deploy the site to HTTPS first** (e.g. `https://geoloan.pk`). Bubblewrap reads the
   live web manifest, so the site must be online over HTTPS before you build.
2. Install **Node.js 18+** and **JDK 17**.
3. Install Bubblewrap:
   ```bash
   npm install -g @bubblewrap/cli
   ```
   (On first run it can download the Android SDK/build tools for you — accept the prompts.)

---

## Step 1 — Initialise the project

In an **empty folder** (not this repo), run:

```bash
bubblewrap init --manifest https://geoloan.pk/manifest.webmanifest
```

Answer the prompts:

- **Application ID / package name:** `com.geoloan.app`  ← must match `assetlinks.json`
- **App name:** `GEO Loan.pk` · **Launcher name:** `GEO Loan`
- **Start URL:** `/app` · **Theme color:** `#15783a` · **Background:** `#ffffff`
- **Signing key:** let it create one. **⚠️ Back up the keystore file + passwords** —
  you need the *same* key for every future update, or users can't update the app.

This generates `twa-manifest.json` + the Android project for you (no manual config needed).

## Step 2 — Build the APK

```bash
bubblewrap build
```

Output: **`app-release-signed.apk`** (install/share this) and `app-release-bundle.aab`
(for the Play Store).

## Step 3 — Link the app to the domain (removes the URL bar)

1. Get your signing **SHA‑256 fingerprint**:
   ```bash
   bubblewrap fingerprint list
   ```
2. Open `public/.well-known/assetlinks.json` in this repo and replace
   `REPLACE_WITH_YOUR_APP_SIGNING_SHA256_FINGERPRINT` with that fingerprint
   (keep `package_name` = `com.geoloan.app`).
3. **Redeploy the site** so `https://geoloan.pk/.well-known/assetlinks.json` serves it.

> Without this, the app still works but shows a Chrome address bar. With it, it looks
> like a full-screen native app.

> If you publish on the Play Store, also add the **Play App Signing** SHA‑256 (from
> Play Console → Setup → App signing) to the same `sha256_cert_fingerprints` array.

## Step 4 — Publish to users (your flow)

1. In the admin dashboard: **Settings → Mobile App (Android APK)** → upload
   `app-release-signed.apk` (set a version like `v1.0.0`).
2. The home page **"Download App"** button now serves it. Android users tap it,
   allow "install from unknown sources" if prompted, and install.

---

## Updating the app later

- Bump `appVersionCode` (and `appVersionName`) in `twa-manifest.json`, run `bubblewrap build`
  with the **same keystore**, then upload the new APK in admin (it replaces the old one).

## Notes

- `com.geoloan.app` is the package id used across `assetlinks.json` and the TWA — keep it consistent.
- Keep the **keystore** safe and private (never commit it).
- The web app must stay reachable at the manifest's `scope` (`/`) for the TWA to load.
