'use client'

import Script from 'next/script'
import { useActionState, useEffect, useRef } from 'react'

import { type EnquiryFormState, submitEnquiry } from '@/app/(frontend)/contact/actions'
import { type EnquiryField, FIELD_ORDER, HONEYPOT_FIELD } from '@/lib/enquiry'
import { TURNSTILE_ORIGIN } from '@/lib/turnstile'

const INITIAL: EnquiryFormState = { status: 'idle' }

/** The radio group's error links to its first option. */
const fieldId = (field: EnquiryField) => (field === 'type' ? 'type-enrolment' : field)

/**
 * The contact and enrolment form, following the GOV.UK Design System's form patterns:
 * labels above fields, an error summary at the top that links to each problem, the error
 * repeated beside its field, and messages that say what to do. After submitting, focus
 * moves to the summary or the confirmation so screen-reader users hear the result.
 *
 * It posts to a server action, so it also works with JavaScript off. Browser validation is
 * turned off (noValidate): its messages are inconsistent and poorly announced.
 */
export function ContactForm({
  turnstileSiteKey,
  retentionMonths,
}: {
  turnstileSiteKey: string | null
  retentionMonths: number
}) {
  const [state, formAction, pending] = useActionState(submitEnquiry, INITIAL)
  const summary = useRef<HTMLDivElement>(null)
  const confirmation = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'error') summary.current?.focus()
    if (state.status === 'sent') confirmation.current?.focus()
  }, [state])

  if (state.status === 'sent') {
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        role="status"
        className="card border-l-green border-l-4 p-6"
      >
        <h2 className="text-display-sm">Message sent</h2>
        <p className="mt-2">Thank you. We’ll reply by email, usually within a few days.</p>
      </div>
    )
  }

  const errors = state.status === 'error' ? state.errors : {}
  const formError = state.status === 'error' ? state.formError : undefined
  const values = state.status === 'error' ? state.values : {}
  const problems = FIELD_ORDER.filter((field) => errors[field])

  const describedBy = (field: EnquiryField, hint?: boolean) =>
    [hint && `${field}-hint`, errors[field] && `${field}-error`].filter(Boolean).join(' ') ||
    undefined

  const error = (field: EnquiryField) =>
    errors[field] && (
      <p id={`${field}-error`} className="field-error">
        <span className="sr-only">Error: </span>
        {errors[field]}
      </p>
    )

  return (
    <form action={formAction} noValidate className="space-y-6">
      {(problems.length > 0 || formError) && (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="card border-accent border-l-4 p-5"
        >
          <h2 id="error-summary-title" className="text-display-sm">
            There is a problem
          </h2>
          {formError && <p className="mt-2">{formError}</p>}
          {problems.length > 0 && (
            <ul className="mt-2">
              {problems.map((field) => (
                <li key={field}>
                  <a
                    href={`#${fieldId(field)}`}
                    className="text-accent inline-flex min-h-11 items-center font-bold"
                  >
                    {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset aria-describedby={describedBy('type')}>
        <legend className="field-label">What is your message about?</legend>
        {error('type')}
        <div className="mt-2 space-y-1">
          {[
            ['enrolment', 'A place for my child'],
            ['general', 'Something else'],
          ].map(([value, label]) => (
            <label key={value} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                id={`type-${value}`}
                name="type"
                value={value}
                defaultChecked={values.type === value}
                className="accent-red size-5"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="name" className="field-label">
          Your name
        </label>
        {error('name')}
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={values.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy('name')}
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <p id="email-hint" className="field-hint">
          We’ll use this to reply to you.
        </p>
        {error('email')}
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={values.email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy('email', true)}
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="phone" className="field-label">
          Phone number (optional)
        </label>
        {error('phone')}
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={values.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy('phone')}
          className="field-input sm:max-w-xs"
        />
      </div>

      <div>
        <label htmlFor="ageBand" className="field-label">
          Your child’s age (optional)
        </label>
        <p id="ageBand-hint" className="field-hint">
          Only if you’re asking about a place. Please don’t send your child’s name or date of birth.
        </p>
        {error('ageBand')}
        <select
          id="ageBand"
          name="ageBand"
          defaultValue={values.ageBand ?? ''}
          aria-invalid={errors.ageBand ? true : undefined}
          aria-describedby={describedBy('ageBand', true)}
          className="field-input sm:max-w-xs"
        >
          <option value="">Not applicable</option>
          <option value="5-7">5 to 7</option>
          <option value="8-11">8 to 11</option>
          <option value="12-16">12 to 16</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Your message
        </label>
        {error('message')}
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          defaultValue={values.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('message')}
          className="field-input"
        />
      </div>

      {/* Hidden from people, and from screen readers; software that fills every field fills it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {turnstileSiteKey && (
        <>
          <Script src={`${TURNSTILE_ORIGIN}/turnstile/v0/api.js`} strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
        </>
      )}

      <p className="text-fg-muted text-sm">
        We use what you send only to reply to you. It is seen only by the school’s administrators
        and deleted after {retentionMonths} months.
      </p>

      <button type="submit" disabled={pending} className="btn-solid">
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
