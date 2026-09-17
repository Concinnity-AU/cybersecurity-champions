/* Optional participant record (name + email), shown below the course CTA.
   Never gates the score or the course — a lead is its own measure. No
   newsletters or marketing: consent_marketing is always false. */

import { useState } from 'react';
import { ArrowIcon, CheckIcon } from './Icon';
import { useTurnstile } from '../lib/turnstile';
import { postLead } from '../lib/api';
import { getAttribution } from '../lib/attribution';
import { config } from '../lib/config';
import { STRINGS } from '../lib/strings';

const S = STRINGS.result;

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className={`field ${error ? 'has-error' : ''}`}>
    <span className="field__label">{label}</span>
    {children}
    {error && <span className="field__error">{error}</span>}
  </label>
);

export const LeadForm = ({ sessionId }: { sessionId: string }) => {
  const [form, setForm] = useState({ firstName: '', email: '', consent: false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [doneName, setDoneName] = useState<string | null>(null);

  const turnstile = useTurnstile(config.turnstileSiteKey);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Please share your first name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'A valid email please';
    if (!form.consent) next.consent = 'Please tick the box to continue';
    setErr(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const token = await turnstile.getToken().catch(() => '');
      if (!token) {
        setServerError('Could not verify you are human. Please try again.');
        return;
      }
      const firstName = form.firstName.trim();
      await postLead({
        session_id: sessionId,
        first_name: firstName,
        email: form.email.trim(),
        // The checkbox consents to being recorded as a program participant only.
        consent_program: true,
        consent_marketing: false,
        turnstile_token: token,
        ...getAttribution(),
      });
      setDoneName(firstName);
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      );
      turnstile.reset();
    } finally {
      setSubmitting(false);
    }
  };

  if (doneName) {
    return (
      <div className="thanks__inboxnote" role="status">
        <span className="thanks__inboxchip">✓</span>
        <span>{S.leadDone(doneName)}</span>
      </div>
    );
  }

  return (
    <form className="lead" onSubmit={submit} noValidate>
      <div className="lead__pitch">
        <div className="lead__kicker lead__kicker--quiet">{S.leadKicker}</div>
        <h3 className="lead__title">{S.leadTitle}</h3>
        <p className="lead__body">{S.leadBody}</p>
      </div>

      <Field label="First name" error={err.firstName}>
        <input
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          placeholder="Maya"
          autoComplete="given-name"
        />
      </Field>
      <Field label="Email" error={err.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <label className={`consent ${err.consent ? 'has-error' : ''}`}>
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
        />
        <span className="consent__box" aria-hidden="true">
          {form.consent && <CheckIcon className="consent__check" />}
        </span>
        <span className="consent__text">{S.leadConsent}</span>
      </label>
      {err.consent && <div className="field__error">{err.consent}</div>}

      <div className="turnstile-host" ref={turnstile.ref} />

      {serverError && <p className="lead__error">{serverError}</p>}

      <button
        type="submit"
        className="btn btn--secondary btn--lg lead__submit"
        disabled={submitting}
      >
        {submitting ? 'Sending…' : S.leadSubmit}
        {!submitting && <ArrowIcon className="btn__icon" />}
      </button>
      <p className="lead__fine">{S.leadFine}</p>

      <details className="lead__privacy">
        <summary>{S.privacyTitle}</summary>
        <ul>
          {S.privacyPoints.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <p>
          {S.privacyContact}{' '}
          <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer">
            oaic.gov.au
          </a>
          .
        </p>
      </details>
    </form>
  );
};
