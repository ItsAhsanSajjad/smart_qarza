<div align="center">

<img src="public/logo.png" alt="GEO Loan.pk" width="220" />

# GEO Loan.pk

**آسان قرض، روشن مستقبل — Easy loans, a brighter future**

A modern, secure digital lending platform with a full admin console — built for the Pakistani market.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## ✨ Overview

GEO Loan.pk is an end-to-end loan management platform with two surfaces:

- **User app** (`/app`) — register, complete KYC, choose a loan package, submit payment proof, and withdraw.
- **Admin console** (`/admin`) — review KYC, approve/reject payments, manage loans, settings, and customer videos.

It’s mobile-first, fully branded (green + gold), and localised for Pakistan (PKR, CNIC, EasyPaisa / JazzCash / bank transfers, Urdu tagline).

## 🚀 Features

### User app
- 📱 Phone + password auth with a **show/hide** toggle and **security-question password recovery** (no OTP dependency)
- 🪪 **KYC** with **live camera capture** (rear camera for CNIC, front camera for selfie) + gallery fallback
- 🔎 Best-effort **in-browser OCR** (Tesseract.js) to read the CNIC and auto-fill the number
- 💸 Loan packages, down-payment & installment flow with animated **“verifying” review** screens
- 🏦 Withdraw via **EasyPaisa / JazzCash / Bank** — searchable bank picker with logos
- 🎬 **“Our Satisfied Customers”** reel carousel

### Admin console
- ✅ **KYC review** — view documents, approve, or reject with multi-select feedback
- 🧾 **Payment approvals** with screenshot review and multi-select rejection reasons
- 👥 Users, 💰 loans, and ⚙️ settings (bank details, packages, markup, admin credentials)
- 🎥 **Customer videos** upload (with live progress bar) shown on the home page

## 🔐 Security

- Passwords & security answers stored as **bcrypt hashes** (never plaintext)
- **HMAC-signed, expiring session cookies** (`secure` in production)
- KYC documents & payment screenshots stored **outside the public web root**, served only via an **authorised, ownership-checked** route
- Server-side validation on every input (phone, CNIC, email, DOB 18+, amounts, uploads)
- Content-sniffed image uploads (no trusting client MIME)
- Admin area hidden from the public site; every `/api/admin/*` route requires an admin session

## 🛠️ Tech Stack

**Next.js 16 (App Router)** · **React 19** · **TypeScript** · **Prisma ORM** (SQLite, swappable to PostgreSQL) · **Tailwind CSS 4** · **bcryptjs** · **Tesseract.js** · **face-api.js** · **lucide-react** · **sonner**

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then fill in SESSION_SECRET, DATABASE_URL, etc.

# 3. Set up the database
npx prisma db push
npx tsx scripts/seed.ts     # seeds default settings + admin account

# 4. Run
npm run dev                 # http://localhost:3000
```

| Surface | URL |
|---|---|
| Home | `http://localhost:3000` |
| User app | `http://localhost:3000/app` |
| Admin console | `http://localhost:3000/admin` |

> Default admin (change after first login): phone `03000000000`, password `admin123`.

## ⚙️ Configuration

Copy `.env.example` → `.env` and set:

- `DATABASE_URL` — SQLite path (dev) or PostgreSQL URL (production)
- `SESSION_SECRET` — random 32+ byte secret for signing sessions
- `UPLOADS_DIR` — writable path **outside** the web root for KYC/payment files

## 🚢 Deployment

Builds to a standalone server (`output: "standalone"`):

```bash
npm run build      # outputs .next/standalone (+ static assets copied in)
npm run start
```

Runs on a Node VPS, a PaaS (Render/Railway/Fly), or shared cPanel hosting (Node app via Passenger). For production, point `DATABASE_URL` at PostgreSQL and set a real `SESSION_SECRET`.

## 📁 Project Structure

```
src/
├─ app/
│  ├─ page.tsx          # landing page
│  ├─ app/page.tsx      # user app (auth, KYC, loans, withdraw)
│  ├─ admin/page.tsx    # admin console
│  └─ api/              # auth, kyc, loan, payment, wallet, admin, reels
├─ components/          # brand, legal, landing widgets, ui (shadcn)
└─ lib/                 # auth, db, validation, uploads, loan helpers
prisma/schema.prisma    # data model
```

## 📄 License

MIT © [Ahsan Sajjad](https://github.com/ItsAhsanSajjad)
