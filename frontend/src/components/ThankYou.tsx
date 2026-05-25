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
          <a
            className="path path--primary"
            href={config.tribalHabitsEnrolUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="path__num">01</div>
            <h3 className="path__title">Start the free e-learning modules</h3>
            <p className="path__body">
              Four short modules on Tribal Habits. Go at your own pace, on any device. 4–8 hours
              total — start whenever suits.
            </p>
            <span className="path__cta">
              Begin online <ArrowIcon className="path__arrow" />
            </span>
          </a>
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
