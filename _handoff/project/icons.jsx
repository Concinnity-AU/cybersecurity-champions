/* Icons — minimal, original glyphs (NOT brand recreations) */
const Icon = {
  shield: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>,

  bolt: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>,

  key: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="14" r="4" />
      <path d="m11 12 9-9m-3 3 2 2" />
    </svg>,

  chat: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
    </svg>,

  wave: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12h2m4-6v12m4-9v6m4-3v0m4-2v4" />
    </svg>,

  qr: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true">
      <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9-2h2v2h-2v-2Zm4 0h3v3h-3v-3Zm-4 4h2v2h2v3h-2v-2h-2v-1Zm4 1h3v2h-3v-2Z" />
    </svg>,

  check: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>,

  cross: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6 18 18M6 18 18 6" />
    </svg>,

  arrow: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>,

  flame: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true">
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5-.4 2-2.7 3-2.7 6 0 3.8 3.1 6.5 6 6.5s6-2.7 6-6.5C18 8 12 2 12 2Z" />
    </svg>,

  alert: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" data-comment-anchor="5a69ba8a69-svg-51-5">
      <path d="M12 3 2 20.5h20L12 3Z" />
      <path d="M12 10v5" />
      <path d="M12 18.2h.01" strokeWidth="3.4" />
    </svg>,

  clock: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>,

  trophy: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true" data-comment-anchor="0b0918f96e-svg-69-3">
      <path d="M6 3h12v1.5h2.5a1.5 1.5 0 0 1 1.5 1.5v2a4 4 0 0 1-4 4h-.3A6 6 0 0 1 13 14.9V17h2.5a1 1 0 0 1 1 1v1.5H7.5V18a1 1 0 0 1 1-1H11v-2.1A6 6 0 0 1 6.3 12H6a4 4 0 0 1-4-4V6a1.5 1.5 0 0 1 1.5-1.5H6V3Zm0 3H3.5v2A2.5 2.5 0 0 0 6 10.5V6Zm12 0v4.5A2.5 2.5 0 0 0 20.5 8V6H18ZM6 20.5h12V22H6v-1.5Z" />
    </svg>,

  sparkle: (cls = '') =>
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true">
      <path d="M12 2 13.5 9 21 10.5 13.5 12 12 19 10.5 12 3 10.5 10.5 9 12 2Z" />
    </svg>

};
window.Icon = Icon;