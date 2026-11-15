import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })
  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('admin can sign in and see the content collections', async ({ page }) => {
    await login({ page, user: testUser })
    await expect(page).toHaveURL(/\/admin/)
    for (const name of ['Events', 'Pages', 'Media', 'Enquiries']) {
      await expect(page.getByRole('link', { name, exact: true }).first()).toBeVisible()
    }
  })
})
