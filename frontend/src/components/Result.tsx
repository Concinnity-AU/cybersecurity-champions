import { useState } from 'react';
import { ArrowIcon, CheckIcon, ShieldIcon, TrophyIcon } from './Icon';
import { useTurnstile } from '../lib/turnstile';
import { postLead } from '../lib/api';
import { config, getUtmParams } from '../lib/config';
import type { LeadPayload } from '../lib/types';

interface ResultProps {
  total: number;
  sessionId: string;
  onSubmit: (firstName: string) => void;
}

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

export const Result = ({ total, sessionId, onSubmit }: ResultProps) => {
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    consent: false,
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
        setSubmitting(false);
        return;
      }
      const utm = getUtmParams();
      const payload: LeadPayload = {
        session_id: sessionId,
        first_name: form.firstName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        consent_program: true,
        consent_marketing: false,
        turnstile_token: token,
        ...utm,
      };
      await postLead(payload);
      onSubmit(form.firstName.trim());
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      );
      turnstile.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen result">
      <div className="result__teaser">
        <div className="result__teaser-badge">
          <TrophyIcon className="result__teaser-icon" />
        </div>
        <div className="result__teaser-kicker">Challenge complete</div>
        <h2 className="result__teaser-title">Your score is ready.</h2>
        <p className="result__teaser-body">
          You answered all {total} questions. Pop your details in below to unlock your full
          breakdown — and learn about the FREE Cybersecurity Champions e-learning modules.
        </p>
        <div className="result__teaser-lockrow">
          <div className="result__teaser-lock">
            <ShieldIcon className="result__teaser-lockicon" />
          </div>
          <div>
            <div className="result__teaser-locktitle">Score locked</div>
            <div className="result__teaser-locksub">Complete the form below to reveal</div>
          </div>
        </div>
      </div>

      <form className="lead" onSubmit={submit} noValidate>
        <div className="lead__pitch">
          <div className="lead__kicker">FREE · No spam, ever</div>
          <h3 className="lead__title">
            Unlock your breakdown — and learn about the free e-learning modules.
          </h3>
          <p className="lead__body">
            Four short self-paced modules (4–8 hours total) on the Tribal Habits platform. Share
            your details and a TIMS coordinator will be in touch with everything you need to get
            started.
          </p>
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
        <Field label="Phone (optional)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="04·· ··· ···"
            autoComplete="tel"
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
          <span className="consent__text">
            I'd like TIMS to contact me about my results and the FREE Champions program.
          </span>
        </label>
        {err.consent && <div className="field__error">{err.consent}</div>}

        <div className="turnstile-host" ref={turnstile.ref} />

        {serverError && <p className="lead__error">{serverError}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--lg lead__submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Reveal my score'}
          {!submitting && <ArrowIcon className="btn__icon" />}
        </button>
        <p className="lead__fine">We'll never share your details. You can opt out any time.</p>
      </form>
    </div>
  );
};
