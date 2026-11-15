# ABSS Online

The website for the **Afruika Bantu Saturday School**, a supplementary school teaching English, Maths, Science and African History to children aged 5 to 16 since 1997.

Built with **Next.js 16 (App Router, TypeScript, Tailwind 4)** and **Payload CMS 3** on **Postgres**, with media in **S3 behind CloudFront**.

## Features

- **Content management:** editors manage events, pages, photos and the school's key facts in the admin. The layout stays in code, so the design can't be broken.
- **Publishing:** pages are prerendered and refresh within seconds of a change in the admin, with no redeploy.
- **Events:** date, venue and summary are required text, with an optional flyer. Finished events move to "past" automatically.
- **Enquiries:** stored with the minimum data, no public API access, readable by admins only.
- **Safeguarding:** every photo upload must state whether it shows children; if it does, parental consent must be confirmed before it can be saved.
- **Location:** one address in Site Settings drives the key facts, the directions link and the map.
- **Media:** images in a private S3 bucket served through CloudFront; video embedded from YouTube.
- **Legacy addresses:** older `.html` addresses redirect permanently to the current pages.
- **Security:** a Content Security Policy and security headers, role-based access, and login lockout after five failed attempts.
- **Accessibility:** WCAG 2.2 AA, checked by axe in the browser tests on every page. `/styleguide` documents the design tokens and colour contrast.

## Architecture

```
┌──────────────────────────── Next.js app (one deploy) ─────────────────────────────┐
│                                                                                   │
│  /admin  ──► Payload admin UI  (roles: admin · editor, drafts)                    │
│  /api/*  ──► Payload REST + GraphQL, health checks                                │
│                                                                                   │
│  public pages ──► statically generated                                            │
│        ▲                                                                          │
│        │ unstable_cache(tags) ◄── revalidateTag() from CMS afterChange hooks      │
│        │                                                                          │
│  src/lib/queries.ts ──► Payload Local API ──► Postgres                            │
│                                       └──► Media: local disk (dev)                │
│                                                   private S3 bucket (production)  │
└───────────────────────────────────────────────────────────────────────────────────┘
        Visitor's browser ──► CloudFront ──► S3      (images)
                          └─► youtube-nocookie.com   (video)
```

## Project layout

```
src/
  access/               access-control rules
  collections/          Events, Pages, Media, Enquiries, Users
  globals/              SiteSettings: the school's key facts, contact and social links
  fields/               shared fields
  hooks/                cache revalidation
  lib/                  queries (all data reads), dates, media storage, security headers,
                        legacy redirects, production checks, utils
  components/           shared UI components
  app/
    (frontend)/         the public site
    (payload)/          Payload admin + API routes (generated, don't edit)
    api/                health checks, manual revalidation
scripts/seed.ts         first admin user
tests/int               Vitest unit and database tests
tests/e2e               Playwright browser tests, including accessibility
```

## Getting started

Requirements: Node 22, pnpm 10, Postgres 14 or later (local, or [Neon](https://neon.tech) free tier). Docker isn't required.

```bash
pnpm install
cp .env.example .env            # fill in DATABASE_URL and PAYLOAD_SECRET
pnpm seed                       # first admin user
pnpm dev                        # http://localhost:3000, admin at /admin
```

In development the database schema is created automatically and uploads are saved to `/media`.

## Scripts

| Script                | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `pnpm dev`            | Dev server with hot reload                                         |
| `pnpm build`          | Production build (fails on type errors)                            |
| `pnpm check`          | Lint, typecheck and Prettier; run before every commit              |
| `pnpm test:int`       | Vitest unit and database tests, in a separate `<db>_test` database |
| `pnpm test:e2e`       | Playwright browser tests against a running dev server              |
| `pnpm seed`           | First admin user; never overwrites                                 |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing a collection      |

## Roadmap

- Contact and enrolment form, with email notification to the school
- Payment page, with card payments through Stripe
- Remaining pages: Trips, Sports, Finances and Forms
- Photo gallery with a lightbox; click-to-load YouTube embeds
- Event filters, "add to calendar" and event structured data
- S3 bucket and CloudFront distribution defined in Terraform
- Deployment
