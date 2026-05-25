import { ArrowIcon } from './Icon';
import { STRINGS } from '../lib/strings';

export const Welcome = ({ onStart }: { onStart: () => void }) => (
  <div className="screen welcome">
    <div className="welcome__hero">
      <div className="welcome__kicker">
        <span className="welcome__dot" />
        {STRINGS.welcomeKicker}
      </div>
      <h1 className="welcome__title">
        Could you be a{' '}
        <span className="welcome__title-accent">
          Cybersecurity
          <br />
          Champion
        </span>
        ?
      </h1>
      <p className="welcome__body">{STRINGS.welcomeBody}</p>
      <button className="btn btn--primary btn--lg welcome__cta" onClick={onStart}>
        {STRINGS.welcomeCta}
        <ArrowIcon className="btn__icon" />
      </button>
      <div className="welcome__meta">
        <span className="welcome__metadot">●</span> {STRINGS.welcomeMeta}
      </div>
    </div>

    <div className="welcome__stats">
      {STRINGS.stats.map((s, i) => (
        <div key={i} className="stat">
          <div className="stat__big">{s.big}</div>
          <div className="stat__label">{s.label}</div>
          {s.sourceUrl && (
            <a
              className="stat__source"
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.source}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      ))}
    </div>

    <div className="welcome__formats">
      <div className="welcome__formats-title">You'll meet four kinds of challenge</div>
      <ul className="welcome__formats-list">
        <li>
          <span className="chip chip--purple">Spot It</span> A message lands — scam or legit?
        </li>
        <li>
          <span className="chip chip--gold">Pick the Stronger</span> Two passwords, side by side.
        </li>
        <li>
          <span className="chip chip--orange">What Do You Do?</span> A real-life moment, with options.
        </li>
        <li>
          <span className="chip chip--green">Real or AI?</span> Spot the modern impersonation.
        </li>
      </ul>
    </div>
  </div>
);
