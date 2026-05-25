/* Minimal original icon glyphs (NOT brand recreations). */

type IconProps = { className?: string };

export const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const BoltIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);
export const KeyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="14" r="4" />
    <path d="m11 12 9-9m-3 3 2 2" />
  </svg>
);
export const ChatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
  </svg>
);
export const WaveIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h2m4-6v12m4-9v6m4-3v0m4-2v4" />
  </svg>
);
export const QrIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9-2h2v2h-2v-2Zm4 0h3v3h-3v-3Zm-4 4h2v2h2v3h-2v-2h-2v-1Zm4 1h3v2h-3v-2Z" />
  </svg>
);
export const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);
export const CrossIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6 18 18M6 18 18 6" />
  </svg>
);
export const ArrowIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);
export const FlameIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5-.4 2-2.7 3-2.7 6 0 3.8 3.1 6.5 6 6.5s6-2.7 6-6.5C18 8 12 2 12 2Z" />
  </svg>
);
export const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
    <path d="M12 3 2 20.5h20L12 3Z" />
    <path d="M12 10v5" />
    <path d="M12 18.2h.01" strokeWidth={3.4} />
  </svg>
);
export const ClockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const TrophyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6 3h12v1.5h2.5a1.5 1.5 0 0 1 1.5 1.5v2a4 4 0 0 1-4 4h-.3A6 6 0 0 1 13 14.9V17h2.5a1 1 0 0 1 1 1v1.5H7.5V18a1 1 0 0 1 1-1H11v-2.1A6 6 0 0 1 6.3 12H6a4 4 0 0 1-4-4V6a1.5 1.5 0 0 1 1.5-1.5H6V3Zm0 3H3.5v2A2.5 2.5 0 0 0 6 10.5V6Zm12 0v4.5A2.5 2.5 0 0 0 20.5 8V6H18ZM6 20.5h12V22H6v-1.5Z" />
  </svg>
);
export const SparkleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2 13.5 9 21 10.5 13.5 12 12 19 10.5 12 3 10.5 10.5 9 12 2Z" />
  </svg>
);
export const CopyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);
export const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2.2C16.5 2.1 15.4 2 14.2 2 11.5 2 9.5 3.7 9.5 6.7V10H6v4h3.5v8h3.5Z" />
  </svg>
);
export const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.92.5 3.78 1.46 5.42L2 22l4.78-1.55a9.86 9.86 0 0 0 5.26 1.5c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm5.83 13.99c-.24.69-1.41 1.31-1.97 1.4-.5.07-1.14.11-1.84-.12-.42-.13-.97-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.83 2.03.9 2.18.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.58.17.29.74 1.22 1.59 1.97 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.66-.14.27.1 1.71.81 2 .95.29.14.49.22.56.34.07.12.07.69-.17 1.38Z" />
  </svg>
);
export const ShareIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);
