import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn, signOut } from '../helpers/events'

const P = `E2E${Date.now()}`

/** A small but structurally complete PDF: objects, a cross-reference table and a trailer. */
const PDF = (() => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = objects.map((object, index) => {
    const offset = body.length
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(body, 'latin1')
})()

test.describe('Forms and documents', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await signIn(request, 'forms')
    const response = await request.post('/api/documents', {
      headers: { Authorization: `JWT ${token}` },
      multipart: {
        file: { name: `${P}-application.pdf`, mimeType: 'application/pdf', buffer: PDF },
        _payload: JSON.stringify({
          title: `${P} application form`,
          description: 'Sign it and send it back to us.',
          category: 'application',
        }),
      },
    })
    if (!response.ok()) throw new Error(`Could not upload: ${await response.text()}`)
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/documents?where[title][contains]=${P}`, {
      headers: { Authorization: `JWT ${token}` },
    })
    await signOut('forms')
  })

  test('lists a document under its group, saying what it is before it is opened', async ({
    page,
    request,
  }) => {
    await page.goto('/forms')
    const group = page.locator('section', {
      has: page.getByRole('heading', { name: 'Join the school', level: 2 }),
    })
    await expect(group.getByRole('heading', { name: `${P} application form` })).toBeVisible()
    await expect(group.getByText('Sign it and send it back to us.')).toBeVisible()

    // Type and size are in the link itself, for screen readers and for parents on mobile data.
    const link = group.getByRole('link', { name: `Download ${P} application form (PDF, 1 KB)` })
    const file = await request.get((await link.getAttribute('href')) ?? '')
    expect(file.status()).toBe(200)
    expect(file.headers()['content-type']).toContain('application/pdf')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('refuses files that are not PDF or Word', async ({ request }) => {
    const response = await request.post('/api/documents', {
      headers: { Authorization: `JWT ${token}` },
      multipart: {
        file: { name: `${P}-policies.zip`, mimeType: 'application/zip', buffer: Buffer.from('PK') },
        _payload: JSON.stringify({ title: `${P} zip`, category: 'policies' }),
      },
    })
    expect(response.ok()).toBe(false)
  })

  test('cannot be uploaded without signing in', async ({ request }) => {
    const response = await request.post('/api/documents', {
      multipart: {
        file: { name: `${P}-anon.pdf`, mimeType: 'application/pdf', buffer: PDF },
        _payload: JSON.stringify({ title: `${P} anonymous`, category: 'parents' }),
      },
    })
    expect(response.status()).toBe(403)
  })
})
