/**
 * Where uploads live. Kept free of imports so next.config.ts, the security headers and the
 * Payload config can all read the same answers.
 *
 * Production: an S3-compatible bucket. The site is set up for Cloudflare R2, which is free
 * for the first 10 GB and has no download charges; because R2 speaks the S3 protocol, the
 * same settings work with Amazon S3 by leaving S3_ENDPOINT unset. Browsers read files from
 * the bucket's public CDN address (MEDIA_CDN_URL), never with credentials. Admin uploads go
 * straight from the browser to the bucket with a short-lived signed URL, because Vercel
 * functions reject request bodies over 4.5 MB and phone photos are often bigger.
 *
 * Local development: nothing is set, and Payload saves uploads to the /media folder.
 */
type Env = Record<string, string | undefined>

/** Folder inside the bucket for images. Documents use their own. */
export const MEDIA_PREFIX = 'media'

export const s3Enabled = (env: Env = process.env): boolean => Boolean(env.S3_BUCKET)

const httpsOrigin = (value: string | undefined): string | null =>
  value && /^https:\/\/[a-z0-9.-]+$/i.test(value) ? value : null

/** The public address files are served from, e.g. https://media.example.org, or null. */
export const mediaCdnOrigin = (env: Env = process.env): string | null =>
  httpsOrigin(env.MEDIA_CDN_URL)

/**
 * The storage service's own address, e.g. https://<account>.r2.cloudflarestorage.com.
 * Set for R2 and other S3-compatible services; unset for Amazon S3.
 */
export const s3Endpoint = (env: Env = process.env): string | null => httpsOrigin(env.S3_ENDPOINT)

/** "auto" for R2; an AWS region such as eu-west-2 for Amazon S3. */
export const s3Region = (env: Env = process.env): string => env.S3_REGION || 'auto'

/**
 * Where the admin's upload requests go, which is the only address the browser may connect
 * to besides this site. With a custom endpoint the bucket is part of the path, so it is the
 * endpoint itself; on Amazon S3 it is the bucket's own subdomain.
 */
export const s3UploadOrigin = (env: Env = process.env): string | null => {
  if (!env.S3_BUCKET) return null
  if (env.S3_ENDPOINT) return s3Endpoint(env)
  return env.S3_REGION ? `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com` : null
}

/** The public address of a stored file. */
export const mediaFileUrl = (filename: string, prefix = MEDIA_PREFIX, env: Env = process.env) =>
  `${mediaCdnOrigin(env) ?? ''}/${[prefix, filename]
    .filter(Boolean)
    .map((part) => part.split('/').map(encodeURIComponent).join('/'))
    .join('/')}`
