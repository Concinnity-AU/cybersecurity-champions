/* User-facing strings, keyed for future translation. */

export const STRINGS = {
  welcomeKicker: 'TIMS × Concinnity · FREE Program',
  welcomeBody:
    'Ten quick challenges. Real scams reported to Scamwatch, ASD and the NASC. About 90 seconds — no sign-up needed to play.',
  welcomeCta: 'Start the challenge',
  welcomeMeta: '10 challenges · ~90 seconds · Mobile-friendly',
  stats: [
    {
      big: '$2.18B',
      label: 'lost to scams in Australia in 2025',
      source: 'NASC · Targeting Scams 2025',
      sourceUrl: 'https://www.nasc.gov.au/reports-and-publications/targeting-scams',
    },
    {
      big: '481,523',
      label: 'scams reported to Australian authorities in 2025',
      source: 'Scamwatch · ACCC',
      sourceUrl: 'https://www.scamwatch.gov.au/research-and-resources/scam-statistics',
    },
    {
      big: '+44%',
      label: 'rise in losses for Australians who speak English as a second language',
      source: 'NASC · H1 2025 update',
      sourceUrl: 'https://www.nasc.gov.au/news',
    },
  ],
  correct: 'Spot on',
  incorrect: 'Not quite',
  nextLabel: 'Next',
  scoreLabel: 'Score',
  streakLabel: (n: number) => `${n} in a row!`,
  tiers: [
    { min: 0, key: 'learner', title: 'Cyber Learner', blurb: 'A great start — every Champion begins right here.', color: 'var(--accent-orange)' },
    { min: 4, key: 'aware', title: 'Cyber Aware', blurb: "You spot most tricks. A little polish and you're a Defender.", color: 'var(--accent-gold)' },
    { min: 7, key: 'defender', title: 'Cyber Defender', blurb: 'Strong instincts — your family is safer with you watching.', color: 'var(--accent-green)' },
    { min: 9, key: 'champion', title: 'Cyber Champion', blurb: 'Outstanding — you know the tricks scammers rely on.', color: '#FFA51C' },
  ] as const,
  // Result screen: score first, free course as the primary CTA, sign-up optional.
  result: {
    kicker: 'Challenge complete',
    scored: (score: number, total: number) => `You scored ${score}/${total}`,
    courseKicker: 'FREE online course',
    courseTitle: 'Build your cyber skills',
    // Bridge from the score to the course, keyed by tier band.
    courseBridge: {
      high: 'Great result. Take the free course to build on what you already know.',
      mid: "Think you're cyber safe? There may be more to learn. Take the free Cybersecurity Champions course.",
      low: 'A few simple changes can make a big difference. Start the free course.',
    },
    courseBody:
      'Four short self-paced modules on Tribal Habits — 4–8 hours in total, on any device. Start whenever suits.',
    courseTokenInstr: 'When you register, Tribal Habits will ask for a code. Use this one:',
    courseCta: 'Start the free course',
    courseCtaWithCode: 'Copy code & start the free course',
    leadKicker: 'Optional',
    leadTitle: 'Let TIMS know you took part',
    leadBody:
      'Add your name and email so TIMS can record you as a participant in the Cybersecurity Champions program.',
    leadConsent:
      'I agree to TIMS recording my name and email as a participant in the Cybersecurity Champions program.',
    leadSubmit: 'Record my participation',
    leadFine: 'Only used to record your participation. No newsletters or marketing emails.',
    leadDone: (name: string) => `Thanks, ${name} — you're recorded as a participant.`,
    workshop: 'Prefer in person? Ask about workshops',
  },
  sourcesIntro:
    'Every scenario in this challenge is based on real scams reported to Australian authorities.',
  sources: [
    { label: 'Scamwatch · ACCC (scam statistics)', url: 'https://www.scamwatch.gov.au/research-and-resources/scam-statistics' },
    { label: 'NASC · Targeting Scams report', url: 'https://www.nasc.gov.au/' },
    { label: 'ASD · Annual Cyber Threat Report', url: 'https://www.cyber.gov.au/about-us/view-all-content/reports-and-statistics' },
    { label: 'Services Australia · myGov scam alerts', url: 'https://www.servicesaustralia.gov.au/scams' },
    { label: 'IDCARE · free identity recovery (1800 595 160)', url: 'https://www.idcare.org/' },
  ],
} as const;

export type TierKey = 'learner' | 'aware' | 'defender' | 'champion';
