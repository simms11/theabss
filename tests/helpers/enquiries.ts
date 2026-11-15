import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/** Removes the enquiries a browser test sent, so test data never builds up in the admin. */
export async function removeEnquiriesFrom(name: string): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'enquiries', where: { name: { equals: name } } })
}
