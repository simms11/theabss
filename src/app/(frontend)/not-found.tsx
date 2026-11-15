import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container-site py-28 text-center">
      <h1 className="text-display-lg">We couldn’t find that page</h1>
      <p className="text-fg-muted mt-4">It may have moved, or the link might be out of date.</p>
      <Link href="/" className="btn-outline mt-8">
        Back to home
      </Link>
    </section>
  )
}
