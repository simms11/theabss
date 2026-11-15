/**
 * Where uploads live. Kept free of imports so next.config.ts, the security headers
 * and the Payload config can all read the same answers.
 *
 * Production: a private S3 bucket. Browsers never talk to the bucket to read; they fetch
 * from CloudFront (MEDIA_CDN_URL), the only thing allowed to read it. Admin uploads go
 * straight from the browser to S3 with a short-lived signed URL, because Vercel functions
 * reject request bodies over 4.5 MB and phone photos are often bigger.
 *
 * Local development: nothing is set, and Payload saves uploads to the /media folder.
 */
type Env = Record<string, string | undefined>

/** Folder inside the bucket, so the bucket can hold other things later (e.g. PDF forms). */
export const MEDIA_PREFIX = 'media'

export const s3Enabled = (env: Env = process.env): boolean => Boolean(env.S3_BUCKET)

/** The CloudFront origin, e.g. https://d123.cloudfront.net, or null when unset or invalid. */
export const mediaCdnOrigin = (env: Env = process.env): string | null => {
  const value = env.MEDIA_CDN_URL
  return value && /^https:\/\/[a-z0-9.-]+$/i.test(value) ? value : null
}

/** The bucket's own address: only the admin's upload requests go here. */
export const s3UploadOrigin = (env: Env = process.env): string | null =>
  env.S3_BUCKET && env.S3_REGION
    ? `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`
    : null

/** The public address of a stored file. */
export const mediaFileUrl = (filename: string, prefix = MEDIA_PREFIX, env: Env = process.env) =>
  `${mediaCdnOrigin(env) ?? ''}/${[prefix, filename]
    .filter(Boolean)
    .map((part) => part.split('/').map(encodeURIComponent).join('/'))
    .join('/')}`
