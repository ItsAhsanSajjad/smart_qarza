import { promises as fs } from 'fs'
import path from 'path'

// Sensitive uploads (CNIC, selfies, payment screenshots) are stored OUTSIDE the
// web-served `public/` folder and streamed only through an authorized route
// (/api/files/...). On shared hosting set UPLOADS_DIR to a writable path that is
// NOT under public_html, e.g. /home/<cpaneluser>/private_uploads.

export type UploadKind = 'kyc' | 'payments'

// Real (sniffed) MIME -> canonical extension. We derive the extension from the
// validated content type, never from the client-supplied file name.
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function isAllowedImage(mime: string): boolean {
  return mime in MIME_EXT
}

export function extForMime(mime: string): string {
  return MIME_EXT[mime] || 'bin'
}

export function contentTypeForName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return EXT_MIME[ext] || 'application/octet-stream'
}

// Storage backend: Vercel Blob in production (serverless has no writable disk),
// local filesystem for dev/self-hosted (cPanel). Selected by the presence of a
// Blob token so the same code runs in both places.
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

export function uploadsRoot(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(process.cwd(), 'private_uploads')
}

function kindDir(kind: UploadKind): string {
  return path.join(uploadsRoot(), kind)
}

// Safe filename: no path separators, no traversal. Filenames we generate look
// like `<userId>-<ts>.<ext>` or `<userId>-<TYPE>-<ts>.<ext>`.
export function isSafeName(name: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(name) && !name.includes('..')
}

// --- Private uploads (KYC docs, payment screenshots) ---------------------
// On Blob these are stored with a deterministic, hard-to-guess pathname
// (`kyc/<cuid userId>-<ts>.ext`) and are only ever streamed back through the
// authenticated, ownership-checked /api/files route — the Blob URL is never
// exposed to the client.
export async function writeUpload(kind: UploadKind, filename: string, buffer: Buffer): Promise<void> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    await put(`${kind}/${filename}`, buffer, {
      access: 'public',
      contentType: contentTypeForName(filename),
      addRandomSuffix: false,
      allowOverwrite: true,
      token: BLOB_TOKEN,
    })
    return
  }
  const dir = kindDir(kind)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, filename), buffer)
}

export async function readUpload(kind: UploadKind, filename: string): Promise<Buffer | null> {
  if (!isSafeName(filename)) return null
  try {
    if (USE_BLOB) {
      const { list } = await import('@vercel/blob')
      const pathname = `${kind}/${filename}`
      const { blobs } = await list({ prefix: pathname, limit: 1, token: BLOB_TOKEN })
      const hit = blobs.find((b) => b.pathname === pathname)
      if (!hit) return null
      const res = await fetch(hit.url, { cache: 'no-store' })
      if (!res.ok) return null
      return Buffer.from(await res.arrayBuffer())
    }
    return await fs.readFile(path.join(kindDir(kind), filename))
  } catch {
    return null
  }
}

// --- Public uploads (customer reels, Android APK) ------------------------
// Returns a URL/path to store in the DB and use directly as a src: a Blob URL
// in production, or a `/reels/…` / `/downloads/…` public path in dev.
export type PublicKind = 'reels' | 'downloads'

export async function writePublicUpload(
  kind: PublicKind,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    const { url } = await put(`${kind}/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: BLOB_TOKEN,
    })
    return url
  }
  const dir = path.join(process.cwd(), 'public', kind)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, filename), buffer)
  return `/${kind}/${filename}`
}

export async function deletePublicUpload(urlOrPath: string | null | undefined): Promise<void> {
  if (!urlOrPath) return
  try {
    if (/^https?:\/\//.test(urlOrPath)) {
      const { del } = await import('@vercel/blob')
      await del(urlOrPath, { token: BLOB_TOKEN })
    } else {
      await fs.unlink(path.join(process.cwd(), 'public', urlOrPath.replace(/^\//, '')))
    }
  } catch {
    /* best-effort cleanup */
  }
}

/* ------------------------------------------------------------------
   Content-based image validation (no native deps — shared-host safe).
   Reads the real file signature + dimensions instead of trusting the
   client-supplied MIME type, so spoofed / corrupt / tiny "junk" files
   are rejected even if the upload claims to be an image.
   ------------------------------------------------------------------ */
export type ImageFormat = 'jpeg' | 'png' | 'webp'
export interface ImageInfo {
  format: ImageFormat
  width: number
  height: number
}

export const MIN_IMAGE_W = 300
export const MIN_IMAGE_H = 200

export function sniffImage(buf: Buffer): ImageInfo | null {
  if (!buf || buf.length < 24) return null

  // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR width/height at byte 16/20
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { format: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  // JPEG: FF D8 FF ... scan for a Start-Of-Frame marker that carries dimensions
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    let off = 2
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue }
      const marker = buf[off + 1]
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { format: 'jpeg', height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) { off += 2; continue }
      const len = buf.readUInt16BE(off + 2)
      if (len < 2) break
      off += 2 + len
    }
    return { format: 'jpeg', width: 0, height: 0 } // valid JPEG, dimensions unknown
  }

  // WEBP: RIFF....WEBP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fourcc = buf.toString('ascii', 12, 16)
    try {
      if (fourcc === 'VP8 ') {
        return { format: 'webp', width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
      }
      if (fourcc === 'VP8X') {
        const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16))
        const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16))
        return { format: 'webp', width, height }
      }
    } catch {
      /* fall through */
    }
    return { format: 'webp', width: 0, height: 0 }
  }

  return null
}

/** Returns an error message if the buffer is not an acceptable image, else null. */
export function validateImage(buf: Buffer, opts?: { minW?: number; minH?: number }): string | null {
  const info = sniffImage(buf)
  if (!info) return 'File is not a valid JPG, PNG, or WEBP image'
  const minW = opts?.minW ?? MIN_IMAGE_W
  const minH = opts?.minH ?? MIN_IMAGE_H
  if (info.width && info.height && (info.width < minW || info.height < minH)) {
    return `Image is too small (min ${minW}×${minH}px). Please upload a clear, full photo.`
  }
  return null
}

export function extForFormat(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format
}
