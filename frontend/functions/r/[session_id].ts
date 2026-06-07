/* GET /r/:session_id — server-rendered HTML with OG tags for social previews. */

import { TIER_LABELS, tierFor } from '../_shared/tiers';
import type { Env, Tier } from '../_shared/types';

interface LookupRow {
  score: number;
  total: number;
  tier: string;
  first_name: string | null;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const onRequestGet: PagesFunction<Env, 'session_id'> = async ({ params, env }) => {
  const sessionId = String(params.session_id || '');
  if (!sessionId) return new Response('Not found', { status: 404 });

  const row = await env.DB
    .prepare(
      `SELECT c.score, c.total, c.tier, l.first_name
         FROM completions c
         LEFT JOIN leads l ON l.id = c.lead_id
        WHERE c.session_id = ?`,
    )
    .bind(sessionId)
    .first<LookupRow>();

  const primary = env.PRIMARY_DOMAIN;
  const ogImageUrl = `https://${primary}/og/${sessionId}.png`;
  const challengeUrl = `https://${primary}/`;
  const shareUrl = `https://${primary}/r/${sessionId}`;

  let score = 0;
  let total = 10;
  let tier: Tier = 'aware';
  let firstName: string | null = null;
  if (row) {
    score = row.score;
    total = row.total;
    tier = (row.tier as Tier) || tierFor(score);
    firstName = row.first_name;
  }

  const displayName = firstName ? firstName : 'Someone';
  const tierLabel = TIER_LABELS[tier];
  const title = row
    ? `${displayName} scored ${score}/${total} on the Cybersecurity Champions Challenge`
    : 'Cybersecurity Champions Challenge';
  // Keep descriptions ≥100 chars — LinkedIn's Post Inspector warns below that.
  const description = row
    ? `${displayName} is a ${tierLabel} on the TIMS Cybersecurity Champions Challenge! Could you spot the scams? Take the free 90-second quiz, based on real scams reported to Scamwatch, the ASD and the NASC.`
    : 'Could you spot the scams? Take the free 90-second TIMS Cybersecurity Champions Challenge, based on real scams reported to Scamwatch, the ASD and the NASC. No sign-up needed to play.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />

  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(shareUrl)}" />
  <meta property="og:image" content="${esc(ogImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Cybersecurity Champions Challenge" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(ogImageUrl)}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root { --tims-purple: #403090; --tims-purple-deep: #2B1F66; --tims-gold: #F0C020; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background:
        radial-gradient(circle at 10% 10%, rgba(240,192,32,0.18), transparent 40%),
        linear-gradient(135deg, var(--tims-purple) 0%, var(--tims-purple-deep) 100%);
      color: #fff;
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      line-height: 1.45;
    }
    main {
      max-width: 640px; width: 100%;
      text-align: center;
      padding: 36px 28px 40px;
      background: rgba(0,0,0,0.18);
      border-radius: 28px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.30);
    }
    .kicker { font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--tims-gold); font-weight: 800; margin-bottom: 16px; }
    h1 { font-size: clamp(28px, 6vw, 42px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 24px; text-wrap: balance; }
    .badge { display: inline-block; margin: 0 auto 24px; padding: 10px 18px; background: var(--tims-gold); color: var(--tims-purple-deep); border-radius: 999px; font-weight: 800; font-size: 18px; }
    .score { font-size: clamp(72px, 18vw, 128px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin: 8px 0 4px; }
    .score span { font-size: 0.4em; opacity: 0.6; font-weight: 600; }
    .sub { font-size: 16px; opacity: 0.85; margin: 0 0 32px; text-wrap: pretty; }
    .cta {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: #fff; color: var(--tims-purple); text-decoration: none;
      font-weight: 800; padding: 16px 28px; border-radius: 999px; font-size: 17px;
      transition: transform .15s ease, box-shadow .2s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    .cta:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(0,0,0,0.32); }
    .arrow { width: 18px; height: 18px; }
    .foot { margin-top: 28px; font-size: 12px; opacity: 0.65; }
    .foot a { color: var(--tims-gold); text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <div class="kicker">TIMS · Cybersecurity Champions</div>
    <h1>${esc(displayName)} took the challenge.</h1>
    <div class="badge">${esc(tierLabel)}</div>
    <div class="score">${score}<span>/${total}</span></div>
    <p class="sub">${esc(description)}</p>
    <a class="cta" href="${esc(challengeUrl)}">
      Take the challenge
      <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </a>
    <p class="foot">A free community program by TIMS &amp; Concinnity · <a href="${esc(challengeUrl)}">${esc(primary)}</a></p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Security-Policy': `frame-ancestors 'self' https://tims.org.au https://www.tims.org.au`,
    },
  });
};
