// Shared validation — safe to import on both client and server (no node-only deps).
// Single source of truth so the UI and the API enforce identical rules.

export function digitsOnly(s: string): string {
  return (s || '').replace(/\D/g, '')
}

/* ---------------- Phone (Pakistan mobile: 03XXXXXXXXX = 11 digits) ---------------- */
export const PHONE_LENGTH = 11
export const PHONE_HINT = 'Enter an 11-digit number starting with 03 (e.g. 03001234567)'

export function normalizePhone(s: string): string {
  let d = digitsOnly(s)
  // tolerate +92 / 0092 / 92 prefixes by mapping to leading 0
  if (d.startsWith('0092')) d = '0' + d.slice(4)
  else if (d.startsWith('92')) d = '0' + d.slice(2)
  return d.slice(0, PHONE_LENGTH)
}

export function isValidPhone(s: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(s))
}

/* ---------------- CNIC (Pakistan: 13 digits, shown as XXXXX-XXXXXXX-X) ---------------- */
export const CNIC_HINT = 'Enter your 13-digit CNIC (e.g. 35202-1234567-1)'

export function cnicDigits(s: string): string {
  return digitsOnly(s).slice(0, 13)
}

export function formatCnic(s: string): string {
  const d = cnicDigits(s)
  const parts = [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean)
  return parts.join('-')
}

export function isValidCnic(s: string): boolean {
  const d = cnicDigits(s)
  // 13 digits; first digit (province/region) is 1-8, and it isn't all-zeros
  return /^[1-8]\d{12}$/.test(d)
}

/* ---------------- Date of birth (must be 18+) ---------------- */
export function isAdult(dob: string, minAge = 18): boolean {
  if (!dob) return false
  const d = new Date(dob)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  if (d > now) return false
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= minAge
}

/* ---------------- CNIC OCR matching (for ID-photo verification) ---------------- */
// Pull every plausible 13-digit CNIC out of noisy OCR text.
export function extractCnicCandidates(text: string): string[] {
  const out = new Set<string>()
  for (const m of (text || '').matchAll(/\d[\d\s-]{11,}\d/g)) {
    const d = m[0].replace(/\D/g, '')
    for (let i = 0; i + 13 <= d.length; i++) out.add(d.slice(i, i + 13))
  }
  return [...out]
}
function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}
// Tolerate up to `maxDist` OCR digit errors.
export function cnicFuzzyEqual(a: string, b: string, maxDist = 1): boolean {
  const x = cnicDigits(a)
  const y = cnicDigits(b)
  if (x.length !== 13 || y.length !== 13) return false
  return levenshtein(x, y) <= maxDist
}

// Does OCR text look like the BACK of a Pakistani CNIC?
// Requires TWO independent signals (an identity marker AND a card-field marker)
// so a random document with one stray keyword doesn't pass.
export function looksLikeCnicBack(text: string): boolean {
  const t = (text || '').toLowerCase()
  const idMarkers = ['pakistan', 'identity', 'national', 'nadra', 'islamic republic']
  const backMarkers = ['date of issue', 'date of expiry', "holder's signature", 'holder', 'signature', 'date of birth']
  return idMarkers.some((k) => t.includes(k)) && backMarkers.some((k) => t.includes(k))
}

// Does the image look like a document/text page rather than a selfie?
export function looksLikeDocument(text: string): boolean {
  if (extractCnicCandidates(text).length > 0) return true
  const words = (text || '').trim().split(/\s+/).filter((w) => w.replace(/[^A-Za-z0-9؀-ۿ]/g, '').length >= 2)
  return words.length >= 10
}

/* ---------------- Name ----------------
   Letters (Latin + Urdu/Arabic), spaces, and . ' - only. No digits/symbols. */
const NAME_DISALLOWED = /[^A-Za-z؀-ۿݐ-ݿࢠ-ࣿ\s.'-]/g

export function sanitizeName(s: string): string {
  return (s || '').replace(NAME_DISALLOWED, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').slice(0, 60)
}

export function isValidName(s: string): boolean {
  const t = (s || '').trim()
  return (
    t.length >= 3 &&
    !/\d/.test(t) &&
    /^[A-Za-z؀-ۿݐ-ݿࢠ-ࣿ\s.'-]+$/.test(t) &&
    /[A-Za-z؀-ۿ]/.test(t)
  )
}

/* ---------------- Email ---------------- */
export function normalizeEmail(s: string): string {
  return (s || '').trim().toLowerCase()
}
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(s))
}

/* ---------------- Password ---------------- */
export const PASSWORD_MIN = 8
export function isValidPassword(s: string): boolean {
  return typeof s === 'string' && s.length >= PASSWORD_MIN
}

/* ---------------- Security question (password recovery) ---------------- */
export const SECURITY_QUESTIONS = [
  "What is your mother's name?",
  "What is your father's name?",
  'What city were you born in?',
  'What was the name of your first school?',
  'What is your favourite food?',
]
export function normalizeAnswer(s: string): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}
export function isValidAnswer(s: string): boolean {
  return normalizeAnswer(s).length >= 2
}

/* ---------------- Bank / wallet account number ----------------
   Accepts local account numbers, IBANs (PK..), and mobile-wallet numbers.
   Letters allowed for IBAN; 10–34 alphanumerics. */
export function normalizeAccount(s: string): string {
  return (s || '').replace(/\s+/g, '').toUpperCase().slice(0, 34)
}
export function isValidAccount(s: string): boolean {
  return /^[A-Z0-9]{10,34}$/.test(normalizeAccount(s))
}
