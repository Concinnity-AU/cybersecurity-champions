/* Welcome, Result (form only — score is gated), ThankYou (reveal + next steps) */
const { useState, useEffect, useRef } = React;

const Welcome = ({ onStart }) =>
<div className="screen welcome">
    <div className="welcome__hero">
      <div className="welcome__kicker">
        <span className="welcome__dot" />
        {STRINGS.welcomeKicker}
      </div>
      <h1 className="welcome__title">
        Could you be a <span className="welcome__title-accent">Cybersecurity<br />Champion</span>?
      </h1>
      <p className="welcome__body">{STRINGS.welcomeBody}</p>
      <button className="btn btn--primary btn--lg welcome__cta" onClick={onStart}>
        {STRINGS.welcomeCta}
        {Icon.arrow('btn__icon')}
      </button>
      <div className="welcome__meta">
        <span className="welcome__metadot">●</span> {STRINGS.welcomeMeta}
      </div>
    </div>

    <div className="welcome__stats">
      {STRINGS.stats.map((s, i) =>
    <div key={i} className="stat">
          <div className="stat__big">{s.big}</div>
          <div className="stat__label">{s.label}</div>
          {s.sourceUrl &&
            <a className="stat__source" href={s.sourceUrl} target="_blank" rel="noopener">
              {s.source}
              <span aria-hidden="true">↗</span>
            </a>
          }
        </div>
    )}
    </div>

    <div className="welcome__formats">
      <div className="welcome__formats-title">You'll meet four kinds of challenge</div>
      <ul className="welcome__formats-list">
        <li><span className="chip chip--purple">Spot It</span> A message lands — scam or legit?</li>
        <li><span className="chip chip--gold">Pick the Stronger</span> Two passwords, side by side.</li>
        <li><span className="chip chip--orange">What Do You Do?</span> A real-life moment, with options.</li>
        <li><span className="chip chip--green">Real or AI?</span> Spot the modern impersonation.</li>
      </ul>
    </div>
  </div>;


const tierFor = (score) => {
  let t = STRINGS.tiers[0];
  for (const tier of STRINGS.tiers) if (score >= tier.min) t = tier;
  return t;
};

/* ----- Result: completion teaser + lead capture. Score is HIDDEN until form submit. ----- */
const Result = ({ total, onSubmit }) => {
  const [form, setForm] = useState({ firstName: '', email: '', phone: '', consent: false });
  const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'Please share your first name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'A valid email please';
    if (!form.consent) next.consent = 'Please tick the box to continue';
    setErr(next);
    if (Object.keys(next).length === 0) onSubmit(form);
  };

  return (
    <div className="screen result">
      <div className="result__teaser">
        <div className="result__teaser-badge">{Icon.trophy('result__teaser-icon')}</div>
        <div className="result__teaser-kicker">Challenge complete</div>
        <h2 className="result__teaser-title">Your score is ready.</h2>
        <p className="result__teaser-body">
          You answered all {total} questions. Pop your details in below to unlock your full breakdown — and learn about the FREE Cybersecurity Champions e-learning modules.
        </p>
        <div className="result__teaser-lockrow">
          <div className="result__teaser-lock">
            {Icon.shield('result__teaser-lockicon')}
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
          <h3 className="lead__title" data-comment-anchor="7c1e6826aa-h3-91-11">Unlock your breakdown — and learn about the free e-learning modules.</h3>
          <p className="lead__body">Four short self-paced modules (4–8 hours total) on the Tribal Habits platform. Share your details and a TIMS coordinator will be in touch with everything you need to get started.</p>
        </div>

        <Field label="First name" error={err.firstName}>
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="Maya"
            autoComplete="given-name" />
        </Field>
        <Field label="Email" error={err.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email" />
        </Field>
        <Field label="Phone (optional)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="04·· ··· ···"
            autoComplete="tel" />
        </Field>

        <label className={`consent ${err.consent ? 'has-error' : ''}`}>
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
          <span className="consent__box" aria-hidden="true">{form.consent && Icon.check('consent__check')}</span>
          <span className="consent__text">I'd like TIMS to contact me about my results and the FREE Champions program.</span>
        </label>
        {err.consent && <div className="field__error">{err.consent}</div>}

        <button type="submit" className="btn btn--primary btn--lg lead__submit">
          Reveal my score
          {Icon.arrow('btn__icon')}
        </button>
        <p className="lead__fine">We'll never share your details. You can opt out any time.</p>
      </form>
    </div>);
};

const Field = ({ label, error, children }) =>
<label className={`field ${error ? 'has-error' : ''}`}>
    <span className="field__label">{label}</span>
    {children}
    {error && <span className="field__error">{error}</span>}
  </label>;


const ScoreRing = ({ score, total, tier }) => {
  const pct = score / total;
  const r = 88;
  const C = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 200 200" className="ring__svg">
        <circle cx="100" cy="100" r={r} className="ring__track" />
        <circle cx="100" cy="100" r={r} className="ring__progress"
        style={{
          stroke: tier.color,
          strokeDasharray: C,
          strokeDashoffset: C * (1 - pct)
        }} />
      </svg>
      <div className="ring__inner" data-comment-anchor="1a29ca06ed-div-158-7">
        <div className="ring__score" data-comment-anchor="89697e7c9a-div-168-9">{score}<span>/{total}</span></div>
        <div className="ring__label">correct</div>
      </div>
    </div>);
};

/* ----- Thank-you: REVEAL (ring + tier + breakdown) + next steps ----- */
const ThankYou = ({ name, score, total, answers, onRestart }) => {
  const tier = tierFor(score);
  return (
    <div className="screen thanks">
      <div className="thanks__reveal" style={{ '--tier': tier.color }}>
        <div className="thanks__reveal-label">
          {name ? `Here you go, ${name}` : 'Here you go'}
        </div>
        <ScoreRing score={score} total={total} tier={tier} />
        <div className="thanks__tier">
          <div className="thanks__tier-label">You're a</div>
          <h2 className="thanks__tier-title">{tier.title}</h2>
          <p className="thanks__tier-blurb">{tier.blurb}</p>
        </div>
        <div className="thanks__breakdown">
          {answers.map((a, i) =>
          <div key={i} className={`result__pill ${a ? 'is-correct' : 'is-wrong'}`}>
              {a ? Icon.check('result__pill-icon') : Icon.cross('result__pill-icon')}
              <span>Q{i + 1}</span>
            </div>
          )}
        </div>
      </div>

      <div className="thanks__inboxnote">
        <span className="thanks__inboxchip">✓</span>
        <span>Thanks — a TIMS coordinator will be in touch with next steps.</span>
      </div>

      <div className="thanks__cta-block">
        <h3 className="thanks__cta-title">Keep going — both FREE</h3>

        <div className="paths">
          <a className="path path--primary" href="#" target="_blank" rel="noopener">
            <div className="path__num">01</div>
            <h3 className="path__title">Start the free e-learning modules</h3>
            <p className="path__body">Four short modules on Tribal Habits. Go at your own pace, on any device. 4–8 hours total — start whenever suits.</p>
            <span className="path__cta">Begin online {Icon.arrow('path__arrow')}</span>
          </a>
          <a className="path path--secondary" href="https://tims.org.au/cybersecurity" target="_blank" rel="noopener">
            <div className="path__num">02</div>
            <h3 className="path__title">Apply for an in-person workshop</h3>
            <p className="path__body">Two 3-hour sessions in Toowoomba, a month apart. Become a Champion who helps your community stay safe online.</p>
            <span className="path__cta">Apply now {Icon.arrow('path__arrow')}</span>
          </a>
        </div>
      </div>

      <div className="thanks__more">
        <a href="https://www.scamwatch.gov.au/about-us/news-and-alerts/subscribe-to-scamwatch-alerts" target="_blank" rel="noopener">Subscribe to Scamwatch alerts</a>
        <span className="thanks__dot">·</span>
        <a href="#" onClick={(e) => {e.preventDefault();if (navigator.share) {navigator.share({ title: 'Cybersecurity Champions Challenge', url: location.href });}}}>Share with family</a>
        <span className="thanks__dot">·</span>
        <a href="#" onClick={(e) => {e.preventDefault();onRestart();}}>Retake the challenge</a>
      </div>

      <details className="sources">
        <summary className="sources__summary">
          <span className="sources__chip">Sources</span>
          <span>Every challenge is based on real reported scams</span>
        </summary>
        <p className="sources__intro">{STRINGS.sourcesIntro}</p>
        <ul className="sources__list">
          {STRINGS.sources.map((s, i) =>
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener">{s.label}<span aria-hidden="true"> ↗</span></a>
            </li>
          )}
        </ul>
      </details>
    </div>);
};


Object.assign(window, { Welcome, Result, ThankYou, tierFor });