/* Header (score + streak + progress) and Footer (logos + FREE chip). */

import { FlameIcon } from './Icon';
import { STRINGS } from '../lib/strings';

interface HeaderProps {
  idx: number;
  total: number;
  score: number;
  streak: number;
  scoreBump: number;
}

export const Header = ({ idx, total, score, streak, scoreBump }: HeaderProps) => (
  <header className="hdr">
    <div className="hdr__left">
      <img src="/assets/tims-sun.png" alt="" className="hdr__sun" width={32} height={32} />
      <span className="hdr__title">Champions Challenge</span>
    </div>
    <div className="hdr__right">
      {streak >= 2 && (
        <div className="streak" key={streak}>
          <FlameIcon className="streak__icon" />
          <span>{STRINGS.streakLabel(streak)}</span>
        </div>
      )}
      <div className="score" key={`s-${scoreBump}`}>
        <span className="score__label">{STRINGS.scoreLabel}</span>
        <span className="score__value">
          {score}
          <span className="score__total">/{total}</span>
        </span>
      </div>
    </div>
    <div className="dots" aria-label={`Question ${idx + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`}
        />
      ))}
    </div>
  </header>
);

export const Footer = () => (
  <footer className="ftr">
    <div className="ftr__free">
      <span className="ftr__free-chip">FREE</span>
      <span>A community program by</span>
    </div>
    <div className="ftr__logos">
      <div className="ftr__logo">
        <img src="/assets/tims-banner.png" alt="Toowoomba International Multicultural Society" />
      </div>
      <span className="ftr__sep">·</span>
      <div className="ftr__logo ftr__logo--concinnity">
        <img src="/assets/concinnity-mark.png" alt="" />
        <span className="ftr__logo-text" style={{ fontFamily: 'Comfortaa' }}>Concinnity</span>
      </div>
    </div>
  </footer>
);

export const Confetti = ({ seed }: { seed: number }) => {
  const pieces = Array.from({ length: 32 }).map((_, i) => {
    const left = (Math.sin(seed * 7.1 + i * 1.3) * 0.5 + 0.5) * 100;
    const delay = (i % 8) * 60;
    const duration = 1400 + (i % 5) * 220;
    const colors = [
      'var(--accent-gold)',
      'var(--accent-orange)',
      'var(--accent-red)',
      'var(--accent-purple)',
      'var(--accent-green)',
    ];
    const c = colors[i % colors.length];
    const rot = (i * 37) % 360;
    return (
      <span
        key={`${seed}-${i}`}
        className="confetti__piece"
        style={{
          left: `${left}%`,
          background: c,
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          transform: `rotate(${rot}deg)`,
        }}
      />
    );
  });
  return (
    <div className="confetti" aria-hidden="true" key={seed}>
      {pieces}
    </div>
  );
};
