import { useState } from 'react';
import { ArrowIcon, CheckIcon, CopyIcon, CrossIcon, FacebookIcon, ShareIcon, WhatsAppIcon } from './Icon';
import { STRINGS, type TierKey } from '../lib/strings';
import { config } from '../lib/config';
import { postShare } from '../lib/api';
import type { SharePlatform } from '../lib/types';

const tierFor = (score: number) => {
  let t: typeof STRINGS.tiers[number] = STRINGS.tiers[0];
  for (const tier of STRINGS.tiers) if (score >= tier.min) t = tier;
  return t;
};

const ScoreRing = ({
  score,
  total,
  tierColor,
}: {
  score: number;
  total: number;
  tierColor: string;
}) => {
  const pct = total > 0 ? score / total : 0;
  const r = 88;
  const C = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 200 200" className="ring__svg">
        <circle cx="100" cy="100" r={r} className="ring__track" />
        <circle
          cx="100"
          cy="100"
          r={r}
          className="ring__progress"
          style={{
            stroke: tierColor,
            strokeDasharray: C,
            strokeDashoffset: C * (1 - pct),
          }}
        />
      </svg>
      <div className="ring__inner">
        <div className="ring__score">
          {score}
          <span>/{total}</span>
        </div>
        <div className="ring__label">correct</div>
      </div>
    </div>
  );
};

interface ThankYouProps {
  name: string;
  score: number;
  total: number;
  answers: boolean[];
  sessionId: string;
  shareUrl: string;
  onRestart: () => void;
}

/** Extract the registration code from the Tribal Habits URL so we can both
 *  attempt URL-based auto-fill AND show the code visibly on the page —
 *  one config value, both behaviours. Tribal Habits' param is
 *  `registration_token`; we also accept `token` for resilience against any
 *  future rename. Returns null if no code is present in the URL. */
function tribalHabitsTokenFromUrl(url: string): string | null {
  try {
    const params = new URL(url).searchParams;
    return params.get('registration_token') ?? params.get('token');
  } catch {
    return null;
  }
}

export const ThankYou = ({
  name,
  score,
  total,
  answers,
  sessionId,
  shareUrl,
  onRestart,
}: ThankYouProps) => {
  const tier = tierFor(score);
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const tribalToken = tribalHabitsTokenFromUrl(config.tribalHabitsEnrolUrl);

  const copyToken = async (): Promise<boolean> => {
    if (!tribalToken) return false;
    try {
      await navigator.clipboard.writeText(tribalToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2500);
      return true;
    } catch {
      return false;
    }
  };

  const openTribalHabits = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Copy first so it's already on the clipboard by the time the new tab loads.
    await copyToken();
    window.open(config.tribalHabitsEnrolUrl, '_blank', 'noopener,noreferrer');
  };

  const trackedShare = (platform: SharePlatform, action?: () => void) => () => {
    postShare({ session_id: sessionId, platform });
    action?.();
  };

  const shareFacebook = trackedShare('facebook', () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(u, '_blank', 'noopener,noreferrer,width=600,height=520');
  });

  const shareWhatsApp = trackedShare('whatsapp', () => {
    const text = `${name ? `${name} scored ` : 'I scored '}${score}/${total} on the Cybersecurity Champions Challenge. Can you beat it? ${shareUrl}`;
    const u = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(u, '_blank', 'noopener,noreferrer');
  });

  const shareCopy = trackedShare('copy', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your share link:', shareUrl);
    }
  });

  const shareNative = trackedShare('native', () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Cybersecurity Champions Challenge',
          text: `${name ? `${name} scored ` : 'I scored '}${score}/${total}. Can you beat it?`,
          url: shareUrl,
        })
        .catch(() => {
          /* user cancelled — fine */
        });
    } else {
      shareCopy();
    }
  });

  return (
    <div className="screen thanks">
      <div className="thanks__reveal">
        <div className="thanks__reveal-label">{name ? `Here you go, ${name}` : 'Here you go'}</div>
        <ScoreRing score={score} total={total} tierColor={tier.color} />
        <div>
          <div className="thanks__tier-label">You're a</div>
          <h2 className="thanks__tier-title">{tier.title}</h2>
          <p className="thanks__tier-blurb">{tier.blurb}</p>
        </div>
        <div className="thanks__breakdown">
          {answers.map((a, i) => (
            <div key={i} className={`result__pill ${a ? 'is-correct' : 'is-wrong'}`}>
              {a ? <CheckIcon className="result__pill-icon" /> : <CrossIcon className="result__pill-icon" />}
              <span>Q{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="thanks__inboxnote">
        <span className="thanks__inboxchip">✓</span>
        <span>Thanks — a TIMS coordinator will be in touch with next steps.</span>
      </div>

      <div className="thanks__share">
        <h3 className="thanks__share-title">Share your result</h3>
        <div className="thanks__share-grid">
          <button className="share-btn" onClick={shareFacebook} type="button">
            <FacebookIcon className="share-btn__icon" />
            Facebook
          </button>
          <button className="share-btn" onClick={shareWhatsApp} type="button">
            <WhatsAppIcon className="share-btn__icon" />
            WhatsApp
          </button>
          <button
            className={`share-btn ${copied ? 'is-copied' : ''}`}
            onClick={shareCopy}
            type="button"
          >
            {copied ? <CheckIcon className="share-btn__icon" /> : <CopyIcon className="share-btn__icon" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="share-btn" onClick={shareNative} type="button">
            <ShareIcon className="share-btn__icon" />
            More
          </button>
        </div>
      </div>

      <div className="thanks__cta-block">
        <h3 className="thanks__cta-title">Keep going — both FREE</h3>
        <div className="paths">
          <div className="path path--primary">
            <div className="path__num">01</div>
            <h3 className="path__title">Start the free e-learning modules</h3>
            <p className="path__body">
              Four short modules on Tribal Habits. Go at your own pace, on any device. 4–8 hours
              total — start whenever suits.
            </p>

            {tribalToken && (
              <>
                <p className="path__token-instr">
                  When you register, Tribal Habits will ask for a code. Use this one:
                </p>
                <button
                  type="button"
                  className={`path__token ${tokenCopied ? 'is-copied' : ''}`}
                  onClick={copyToken}
                  aria-label={
                    tokenCopied
                      ? `Registration code ${tribalToken} copied to clipboard`
                      : `Copy registration code ${tribalToken} to clipboard`
                  }
                >
                  <code className="path__token-value">{tribalToken}</code>
                  <span className="path__token-action" aria-hidden="true">
                    {tokenCopied ? (
                      <>
                        <CheckIcon className="path__token-icon" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="path__token-icon" />
                        Tap to copy
                      </>
                    )}
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              className="path__cta-btn"
              onClick={openTribalHabits}
            >
              {tribalToken
                ? 'Copy code & open registration'
                : 'Open registration'}
              <ArrowIcon className="path__arrow" />
            </button>
          </div>
          <a
            className="path path--secondary"
            href={config.workshopEnquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="path__num">02</div>
            <h3 className="path__title">Apply for an in-person workshop</h3>
            <p className="path__body">
              Two 3-hour sessions in Toowoomba, a month apart. Become a Champion who helps your
              community stay safe online.
            </p>
            <span className="path__cta">
              Apply now <ArrowIcon className="path__arrow" />
            </span>
          </a>
        </div>
      </div>

      <div className="thanks__more">
        <a href={config.scamwatchSubscribeUrl} target="_blank" rel="noopener noreferrer">
          Subscribe to Scamwatch alerts
        </a>
        <span className="thanks__dot">·</span>
        <a href="#" onClick={(e) => { e.preventDefault(); onRestart(); }}>
          Retake the challenge
        </a>
      </div>

      <details className="sources">
        <summary className="sources__summary">
          <span className="sources__chip">Sources</span>
          <span>Every challenge is based on real reported scams</span>
        </summary>
        <p className="sources__intro">{STRINGS.sourcesIntro}</p>
        <ul className="sources__list">
          {STRINGS.sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export { tierFor, type TierKey };
