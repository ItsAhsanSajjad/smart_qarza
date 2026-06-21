# GEO Loan.pk — Deploy to HostBreak (cPanel)

Tailored to your account from your cPanel:
- **cPanel user:** `geoloanp` · **Home:** `/home/geoloanp` · **Server IP:** `95.217.116.67`
- **Memory:** 1 GB → the app is **built on your PC and uploaded** (do NOT build on the server — it would run out of memory).
- **SSL:** already Active ✓ · **Setup Node.js App:** available ✓ · **SSH:** available ✓

The package (`geoloan-publish.zip`) is **self-contained** — the Prisma database engine is bundled and the database comes **pre-seeded**, so there is **no npm install, no build, no command-line database setup** on the server.

---

## What's in the zip
```
geoloan/          → the app (upload to /home/geoloanp/geoloan/)
geoloan-data/
  └─ prod.db      → the database (upload to /home/geoloanp/geoloan-data/)
.env.example      → reference only
DEPLOY-HOSTBREAK.md (this file)
```

---

## STEP 1 — Upload & extract
1. cPanel → **File Manager** → go to **Home** (`/home/geoloanp`).
2. **Upload** `geoloan-publish.zip`.
3. Select it → **Extract**. You should now have `/home/geoloanp/geoloan/` and `/home/geoloanp/geoloan-data/prod.db`.
4. Create the uploads folder: File Manager → **+ Folder** in Home → name it **`geoloan-uploads`** (this holds KYC/payment files, kept out of the public web).

## STEP 2 — Create the Node.js app
cPanel → **Software → Setup Node.js App → Create Application**

| Field | Value |
|---|---|
| **Node.js version** | **20.x** (pick 20 or higher). ⚠️ If the dropdown only shows ≤18, open a HostBreak ticket: *"please enable Node.js 20 LTS"* — required. |
| **Application mode** | **Production** |
| **Application root** | `geoloan` |
| **Application URL** | your domain (e.g. `geoloanp.pk`) |
| **Application startup file** | `server.js` |

Click **Create**. (Do **not** click "Run NPM Install" — the package already includes everything.)

## STEP 3 — Environment variables
On the app's page, **Add Variable** (three of them):

| Name | Value |
|---|---|
| `DATABASE_URL` | `file:/home/geoloanp/geoloan-data/prod.db` |
| `UPLOADS_DIR` | `/home/geoloanp/geoloan-uploads` |
| `SESSION_SECRET` | `cbe49e01c596b1bfc643f9877347ac68abd7ecc733beb76b8977d8f9c2234549218439ab3da7a0e804537c712e8546a1` |

(That secret was generated for you. Keep it private; changing it later logs everyone out.)

## STEP 4 — Start
Click **Restart** (or "Run JS script" is not needed). Open your domain — `https://geoloanp.pk` — it should load over the existing SSL.

## STEP 5 — First login & go live
1. Visit `https://geoloanp.pk/admin` → log in: **`03000000000` / `admin123`**.
2. **Admin → Settings**: change the **admin password**, set your real **bank / EasyPaisa / JazzCash** details, and your **Loan Packages** + **Down Payment %**. These reflect on the user app immediately.
3. Test the user flow at `https://geoloanp.pk/app`.

That's it. 🎉

---

## Updating later (redeploy)
On your PC: `npm run build`, then zip the `.next/standalone` contents and re-upload into `/home/geoloanp/geoloan/` (overwrite). **Leave `geoloan-data/` and `geoloan-uploads/` untouched** (that's your live data). Then **Restart** the app in cPanel.

> Schema change? Then also upload the new `prod.db` once, or run `npx prisma db push` in SSH (see below). For normal code/UI changes, no DB steps.

---

## Troubleshooting

**App won't start / 503**
- Setup Node.js App page must show **running**. Click **Restart**.
- Check the log shown on the app page (or `/home/geoloanp/geoloan/stderr.log`).
- Most common cause: Node version < 18.18 → switch to Node 20. Or a missing env var (`DATABASE_URL`).

**"Query engine library not found" (Prisma)**
- Shouldn't happen — both Linux engines are bundled. If it does, the server's OpenSSL is unusual; SSH in and run:
  ```bash
  ssh geoloanp@geoloanp.pk -p 22022      # HostBreak SSH port is 22022, not 22
  source /home/geoloanp/nodevenv/geoloan/20/bin/activate && cd /home/geoloanp/geoloan
  npx prisma generate && touch tmp/restart.txt
  ```

**Page loads but no styling / images 404**
- The `geoloan/` folder must contain `.next/`, `public/`, `node_modules/`, and `server.js` together. If you extracted one level too deep, move the files up so `server.js` sits directly in `/home/geoloanp/geoloan/`. Restart.

**KYC / payment upload fails (not writable)**
- Confirm `geoloan-uploads` exists in Home and `UPLOADS_DIR` points to `/home/geoloanp/geoloan-uploads`. In File Manager set its permissions to **700**.

**Database errors / can't write**
- The `geoloan-data` folder and `prod.db` must be owned by `geoloanp` and writable (SQLite also writes a `-journal`/`-wal` file next to it). Permissions **700** on the folder, **600** on `prod.db`.

---

## Notes / honest flags
- This is a **Node.js app**, not PHP — it must run under "Setup Node.js App". (Your plan supports it ✓.)
- **SQLite** is fine for launch/low traffic on one server. If you later need scale or multiple app instances, migrate to **MySQL/PostgreSQL** (cPanel has MySQL) — say the word and I'll switch the Prisma provider.
- The app has a **fake-disbursement / advance-fee** loan flow (user pays a down-payment to "unlock" withdrawal, admin pays out manually). Make sure that matches your real, legal business model before taking real customers.
- The **NADRA** step on the KYC screen is a visual animation, not a real NADRA Verisys check.
