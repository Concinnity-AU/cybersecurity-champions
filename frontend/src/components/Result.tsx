/* Result screen — score first, free course as the primary CTA, then an
   optional participant sign-up (name + email), then a "challenge them" share
   block. Nothing sits between finishing the Challenge and the course. */

import { useState } from 'react';
import {
  ArrowIcon,
  CheckIcon,
  CopyIcon,
  CrossIcon,
  FacebookIcon,
  LinkedInIcon,
  ShareIcon,
  WhatsAppIcon,
  XIcon,
} from './Icon';
import { LeadForm } from './LeadForm';
import { STRINGS, type TierKey } from '../lib/strings';
import { config } from '../lib/config';
import { postEvent, postShare } from '../lib/api';
import type { SharePlatform } from '../lib/types';

const S = STRINGS.result;

const tierFor = (score: number) => {
  let t: typeof STRINGS.tiers[number] = STRINGS.tiers[0];
  for (const tier of STRINGS.tiers) if (score >= tier.min) t = tier;
  return t;
};

const bridgeFor = (tier: TierKey): string =>
  tier === 'champion'
    ? S.courseBridge.high
    : tier === 'learner'
      ? S.courseBridge.low
      : S.courseBridge.mid;

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

interface ResultProps {
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

export const Result = ({
  score,
  total,
  answers,
  sessionId,
  shareUrl,
  onRestart,
}: ResultProps) => {
  const tier = tierFor(score);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState<'copy' | 'native' | null>(null);
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

  const openCourse = async (e: React.MouseEvent) => {
    e.preventDefault();
    postEvent({ session_id: sessionId, event_type: 'course_cta_click' });
    // Copy first so it's already on the clipboard by the time the new tab loads.
    await copyToken();
    window.open(config.tribalHabitsEnrolUrl, '_blank', 'noopener,noreferrer');
  };

  // Each platform gets its own link so a friend who plays can be traced back
  // to this share — see functions/_shared/share.ts.
  const linkFor = (platform: SharePlatform): string => {
    try {
      const u = new URL(shareUrl);
      u.searchParams.set('via', platform);
      return u.toString();
    } catch {
      return shareUrl;
    }
  };

  const shareText = S.shareText(score, total, tier.title);
  const popup = (u: string, features = 'noopener,noreferrer') => window.open(u, '_blank', features);

  const share = (platform: SharePlatform) => {
    postShare({ session_id: sessionId, platform });
    const link = encodeURIComponent(linkFor(platform));
    const text = encodeURIComponent(shareText);
    switch (platform) {
      case 'facebook':
        popup(`https://www.facebook.com/sharer/sharer.php?u=${link}`, 'noopener,noreferrer,width=600,height=520');
        break;
      case 'whatsapp':
        popup(`https://wa.me/?text=${text}%20${link}`);
        break;
      case 'linkedin':
        popup(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, 'noopener,noreferrer,width=600,height=620');
        break;
      case 'twitter':
        popup(`https://x.com/intent/tweet?text=${text}&url=${link}`, 'noopener,noreferrer,width=600,height=520');
        break;
    }
  };

  const copyLink = async (button: 'copy' | 'native') => {
    postShare({ session_id: sessionId, platform: 'copy' });
    const link = linkFor('copy');
    try {
      await navigator.clipboard.writeText(link);
      setCopiedFrom(button);
      setTimeout(() => setCopiedFrom(null), 2000);
    } catch {
      window.prompt('Copy your share link:', link);
    }
  };

  const shareNative = () => {
    // No share sheet (most desktop browsers) → copy the link instead.
    if (!navigator.share) {
      void copyLink('native');
      return;
    }
    postShare({ session_id: sessionId, platform: 'native' });
    navigator
      .share({ title: 'Cybersecurity Champions Challenge', text: shareText, url: linkFor('native') })
      .catch(() => {
        /* user cancelled — fine */
      });
  };

  return (
    <div className="screen thanks">
      <div className="thanks__reveal">
        <div className="thanks__reveal-label">{S.kicker}</div>
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

      <section className="path path--primary course" aria-labelledby="course-title">
        <div className="lead__kicker">{S.courseKicker}</div>
        <h3 className="path__title course__title" id="course-title">{S.courseTitle}</h3>
        <p className="course__bridge">
          <strong>{S.scored(score, total)}.</strong> {bridgeFor(tier.key)}
        </p>
        <p className="path__body">{S.courseBody}</p>

        {tribalToken && (
          <>
            <p className="path__token-instr">{S.courseTokenInstr}</p>
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

        <button type="button" className="path__cta-btn" onClick={openCourse}>
          {tribalToken ? S.courseCtaWithCode : S.courseCta}
          <ArrowIcon className="path__arrow" />
        </button>
      </section>

      <LeadForm sessionId={sessionId} />

      <section className="thanks__share" aria-labelledby="share-title">
        <p className="thanks__share-score">{S.shareScore(score, total, tier.title)}</p>
        <h3 className="thanks__share-title" id="share-title">
          {S.shareTitle} <span className="thanks__share-cta">{S.shareCta}</span>
        </h3>
        <div className="thanks__share-grid">
          <button className="share-btn" onClick={() => share('facebook')} type="button">
            <FacebookIcon className="share-btn__icon" />
            Facebook
          </button>
          <button className="share-btn" onClick={() => share('whatsapp')} type="button">
            <WhatsAppIcon className="share-btn__icon" />
            WhatsApp
          </button>
          <button className="share-btn" onClick={() => share('linkedin')} type="button">
            <LinkedInIcon className="share-btn__icon" />
            LinkedIn
          </button>
          <button
            className={`share-btn ${copiedFrom === 'native' ? 'is-copied' : ''}`}
            onClick={shareNative}
            type="button"
          >
            {copiedFrom === 'native' ? <CheckIcon className="share-btn__icon" /> : <ShareIcon className="share-btn__icon" />}
            {copiedFrom === 'native' ? S.shareCopied : S.shareNative}
          </button>
        </div>
        <div className="thanks__share-more">
          <button
            className={`share-link ${copiedFrom === 'copy' ? 'is-copied' : ''}`}
            onClick={() => copyLink('copy')}
            type="button"
          >
            {copiedFrom === 'copy' ? <CheckIcon className="share-link__icon" /> : <CopyIcon className="share-link__icon" />}
            {copiedFrom === 'copy' ? S.shareCopied : S.shareCopy}
          </button>
          <span className="thanks__dot" aria-hidden="true">·</span>
          <button className="share-link" onClick={() => share('twitter')} type="button">
            <XIcon className="share-link__icon" />
            {S.shareX}
          </button>
        </div>
      </section>

      <div className="thanks__more">
        <a
          href={config.workshopEnquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => postEvent({ session_id: sessionId, event_type: 'workshop_click' })}
        >
          {S.workshop}
        </a>
        <span className="thanks__dot">·</span>
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
