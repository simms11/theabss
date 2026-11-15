import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Documents } from './collections/Documents'
import { Enquiries } from './collections/Enquiries'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { PageContent } from './globals/PageContent'
import { SiteSettings } from './globals/SiteSettings'
import { shouldPushSchema } from './lib/localDatabase'
import { MEDIA_PREFIX, mediaFileUrl, s3Enabled, s3Endpoint, s3Region } from './lib/mediaStorage'
import { assertProductionEnv } from './lib/productionEnv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

assertProductionEnv()

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · ABSS',
    },
  },
  collections: [Events, Pages, Media, Documents, Enquiries, Users],
  globals: [SiteSettings, PageContent],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Push only a local dev database; hosted databases and production use migrations.
    push: shouldPushSchema(process.env),
  }),
  // Enquiry notifications. Without a key (local development, tests) Payload writes the
  // email to the console instead of sending it.
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: process.env.EMAIL_FROM || 'noreply@theabss.org',
          defaultFromName: 'ABSS website',
        }),
      }
    : {}),
  sharp,
  upload: {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  },
  plugins: [
    seoPlugin({
      collections: ['pages', 'events'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title ?? ''} · ABSS`,
      generateDescription: ({ doc }) => doc?.intro ?? doc?.summary ?? '',
      generateImage: ({ doc }) => doc?.flyer,
      generateURL: ({ collectionConfig, doc }) =>
        collectionConfig?.slug === 'events'
          ? `${serverURL}/events`
          : `${serverURL}/${doc?.slug ?? ''}`,
    }),
    // Without S3_BUCKET (local development) the plugin is disabled and media is stored on disk.
    s3Storage({
      enabled: s3Enabled(),
      // The plugin adds columns to media. Add them even when disabled, so the schema (and the
      // migrations generated locally) match production.
      alwaysInsertFields: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: s3Region(),
        // Cloudflare R2 and other S3-compatible services have their own address and put the
        // bucket in the path. Unset, the adapter talks to Amazon S3.
        ...(s3Endpoint() ? { endpoint: s3Endpoint() as string, forcePathStyle: true } : {}),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      collections: {
        media: {
          prefix: MEDIA_PREFIX,
          // Media is public: serve files from the bucket's CDN address rather
          // than through a server function on every request.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename: file, prefix }) => mediaFileUrl(file, prefix),
        },
        documents: {
          prefix: 'documents',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename: file, prefix }) => mediaFileUrl(file, prefix),
        },
      },
      // Browser uploads straight to S3 with a signed URL: Vercel functions reject request
      // bodies over 4.5 MB. The bucket's CORS rule must allow PUT from this site.
      clientUploads: true,
    }),
  ],
  cors: [serverURL],
  csrf: [serverURL],
})
