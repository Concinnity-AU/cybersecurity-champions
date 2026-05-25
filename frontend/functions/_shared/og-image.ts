/* Dynamic Open Graph image generation using satori + @resvg/resvg-wasm.
   Renders a 1200×630 PNG for Facebook / Twitter / LinkedIn previews.
   Fonts are fetched on first request and cached in module scope
   for the life of the isolate. */

import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
// @ts-ignore — wasm module imported via wrangler CompiledWasm rule
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { TIER_COLORS, TIER_LABELS } from './tiers';
import type { Tier } from './types';

const TIMS_PURPLE = '#403090';
const TIMS_PURPLE_DEEP = '#2B1F66';
const TIMS_GOLD = '#F0C020';
const INK_WHITE = '#ffffff';
const INK_DIM = 'rgba(255,255,255,0.75)';

let wasmReady: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm).catch((e) => {
      wasmReady = null;
      throw e;
    });
  }
  return wasmReady;
}

let logoCache: string | null = null;
async function loadLogo(requestUrl: string): Promise<string> {
  if (logoCache) return logoCache;
  const url = new URL('/assets/tims-sun.png', new URL(requestUrl).origin).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Logo fetch failed: ${url} → ${res.status}`);
  const buf = await res.arrayBuffer();
  // ArrayBuffer → base64 (chunked to avoid blowing the stack on large bufs)
  const bytes = new Uint8Array(buf);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  logoCache = `data:image/png;base64,${btoa(binary)}`;
  return logoCache;
}

let fontsCache: { name: string; data: ArrayBuffer; weight: number; style: 'normal' }[] | null = null;
async function loadFonts(requestUrl: string) {
  if (fontsCache) return fontsCache;
  // Fonts are bundled in public/fonts/ and served same-origin by Pages.
  // In dev this proxies through wrangler → vite; in prod they're static
  // assets on the same deployment. No third-party dependency at runtime.
  const base = new URL(requestUrl);
  // Satori parses raw OpenType (TTF/OTF) — not WOFF2, which is compressed
  // and would require a brotli decoder in the Worker bundle.
  const files: { weight: number; path: string }[] = [
    { weight: 800, path: '/fonts/Manrope-ExtraBold.ttf' },
    { weight: 600, path: '/fonts/Manrope-SemiBold.ttf' },
    { weight: 400, path: '/fonts/Manrope-Regular.ttf' },
  ];
  const loaded = await Promise.all(
    files.map(async ({ weight, path }) => {
      const url = new URL(path, base.origin).toString();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Font fetch failed: ${url} → ${res.status}`);
      const data = await res.arrayBuffer();
      return { name: 'Manrope', data, weight, style: 'normal' as const };
    }),
  );
  fontsCache = loaded;
  return loaded;
}

type El = { type: string; props: { style?: Record<string, unknown>; children?: unknown }; key: null };
const el = (type: string, props: Record<string, unknown> = {}, children?: unknown): El => ({
  type,
  props: { ...props, children },
  key: null,
});

export interface OgInput {
  score: number;
  total: number;
  tier: Tier;
  firstName: string | null;
  domain: string;
  /** The request URL — used to fetch same-origin fonts and logo. */
  requestUrl: string;
}

interface OgInputResolved extends OgInput {
  logoDataUri: string;
}

function buildTree(input: OgInputResolved) {
  const { score, total, tier, firstName, domain, logoDataUri } = input;
  const accent = TIER_COLORS[tier];
  const tierLabel = TIER_LABELS[tier];
  const name = firstName ? firstName : 'Someone';

  return el(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${TIMS_PURPLE} 0%, ${TIMS_PURPLE_DEEP} 100%)`,
        color: INK_WHITE,
        fontFamily: 'Manrope',
        padding: '64px 72px',
        position: 'relative',
      },
    },
    [
      el('div', {
        style: {
          position: 'absolute',
          right: '-120px',
          top: '-140px',
          width: '440px',
          height: '440px',
          background: 'rgba(240,192,32,0.18)',
          borderRadius: '999px',
          display: 'flex',
        },
      }),
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          },
        },
        [
          el('img', {
            src: logoDataUri,
            width: 56,
            height: 56,
            style: { width: '56px', height: '56px', borderRadius: '50%' },
          }),
          el(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: TIMS_GOLD,
              },
            },
            'Cybersecurity Champions Challenge',
          ),
        ],
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '32px',
          },
        },
        [
          el(
            'div',
            { style: { display: 'flex', flexDirection: 'column', maxWidth: '640px' } },
            [
              el(
                'div',
                { style: { fontSize: '36px', fontWeight: 600, color: INK_DIM, marginBottom: '8px' } },
                `${name} took the challenge`,
              ),
              el(
                'div',
                { style: { fontSize: '72px', fontWeight: 800, lineHeight: 1.05, color: INK_WHITE, marginBottom: '20px' } },
                'Could you do better?',
              ),
              el(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignSelf: 'flex-start',
                    background: accent,
                    color: TIMS_PURPLE_DEEP,
                    padding: '10px 22px',
                    borderRadius: '999px',
                    fontSize: '30px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                  },
                },
                tierLabel.toUpperCase(),
              ),
            ],
          ),
          el(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '300px',
                height: '300px',
                background: 'rgba(255,255,255,0.08)',
                border: `6px solid ${accent}`,
                borderRadius: '999px',
              },
            },
            [
              el(
                'div',
                { style: { fontSize: '160px', fontWeight: 800, lineHeight: 1, color: INK_WHITE } },
                String(score),
              ),
              el(
                'div',
                { style: { fontSize: '32px', fontWeight: 600, color: INK_DIM, marginTop: '-12px' } },
                `out of ${total}`,
              ),
            ],
          ),
        ],
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            fontSize: '26px',
            fontWeight: 600,
            color: INK_DIM,
          },
        },
        [
          el('div', {}, 'Take the 90-second challenge'),
          el('div', { style: { color: TIMS_GOLD, fontWeight: 800 } }, domain),
        ],
      ),
    ],
  );
}

export async function renderOgPng(input: OgInput): Promise<Uint8Array> {
  await ensureWasm();
  const [fonts, logoDataUri] = await Promise.all([
    loadFonts(input.requestUrl),
    loadLogo(input.requestUrl),
  ]);
  const tree = buildTree({ ...input, logoDataUri });
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
