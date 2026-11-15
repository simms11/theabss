/**
 * Questions parents ask, as an accordion. Each question is a native <details> element: it
 * opens from the keyboard, is announced as expanded or collapsed, works with JavaScript off,
 * and the browser's find-in-page opens the matching answer. Several can be open at once, so
 * a parent can compare answers.
 */
export function Faq({
  items,
}: {
  items: Array<{ question: string; answer: string; id?: string | null }>
}) {
  return (
    <div className="border-ink max-w-3xl border-t-2">
      {items.map((item) => (
        <details key={item.id ?? item.question} className="group border-line border-b">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.question}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="text-accent size-6 shrink-0 transition-transform duration-200 group-open:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </summary>
          <p className="max-w-prose pb-5 whitespace-pre-line">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
