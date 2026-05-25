/* Challenge screen — renders one of four types based on challenge.type.
   The picked answer is held locally; parent transitions on the timeout. */

import { useEffect, useState } from 'react';
import type { ApiChallenge, PickStrongerMetadata, ScenarioMetadata, SpotItMetadata } from '../lib/types';
import { Mockup, QRGlyph } from './Mockup';
import {
  AlertIcon, CheckIcon, ChatIcon, ClockIcon, KeyIcon, QrIcon, ShieldIcon, WaveIcon,
} from './Icon';

interface Picked {
  value: string;
  isCorrect: boolean;
}

interface ChallengeProps {
  challenge: ApiChallenge;
  onAnswer: (isCorrect: boolean, answer: string, timeMs: number) => void;
}

export const Challenge = ({ challenge, onAnswer }: ChallengeProps) => {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => performance.now());

  useEffect(() => {
    setPicked(null);
    setStartedAt(performance.now());
  }, [challenge.key]);

  const handlePick = (value: string, isCorrect: boolean) => {
    if (picked !== null) return;
    const timeMs = Math.round(performance.now() - startedAt);
    setPicked({ value, isCorrect });
    setTimeout(() => onAnswer(isCorrect, value, timeMs), 500);
  };

  const typeChip =
    challenge.type === 'spot_it'
      ? <span className="typechip typechip--spot">Spot it</span>
      : challenge.type === 'pick_stronger'
      ? <span className="typechip typechip--password">Pick the stronger</span>
      : challenge.type === 'scenario'
      ? <span className="typechip typechip--scenario">What do you do?</span>
      : <span className="typechip typechip--ai">Real or AI?</span>;

  return (
    <div className="screen challenge" data-type={challenge.type}>
      <div className="prompt">
        {typeChip}
        {challenge.type === 'spot_it' && (
          <h2 className="prompt__text">{challenge.prompt}</h2>
        )}
      </div>

      {challenge.type === 'spot_it' && (
        <SpotItBody c={challenge} picked={picked} onPick={handlePick} />
      )}
      {challenge.type === 'pick_stronger' && (
        <PasswordBody c={challenge} picked={picked} onPick={handlePick} />
      )}
      {challenge.type === 'scenario' && (
        <ScenarioBody c={challenge} picked={picked} onPick={handlePick} aiMode={false} />
      )}
      {challenge.type === 'real_ai' && (
        <ScenarioBody c={challenge} picked={picked} onPick={handlePick} aiMode={true} />
      )}
    </div>
  );
};

/* ---- Spot It ---- */
const SpotItBody = ({
  c,
  picked,
  onPick,
}: {
  c: ApiChallenge;
  picked: Picked | null;
  onPick: (value: string, isCorrect: boolean) => void;
}) => {
  const meta = c.metadata as SpotItMetadata;
  const lockedRight = (val: string) => picked?.value === val && picked.isCorrect;
  const lockedWrong = (val: string) => picked?.value === val && !picked.isCorrect;
  const isPicked = (val: string) => picked?.value === val;

  return (
    <div className="spot">
      <div className="spot__mockup">
        <Mockup data={meta} />
      </div>
      <div className="spot__buttons">
        {c.options.map((opt) => {
          const isCorrect = opt.id === c.correct_answer;
          const isScam = opt.id === 'scam';
          return (
            <button
              key={opt.id}
              className={`bigbtn bigbtn--${isScam ? 'scam' : 'legit'} ${
                isPicked(opt.id) ? 'is-picked' : ''
              } ${lockedRight(opt.id) ? 'is-right' : ''} ${
                lockedWrong(opt.id) ? 'is-wrong' : ''
              }`}
              onClick={() => onPick(opt.id, isCorrect)}
              disabled={picked !== null}
            >
              <span className="bigbtn__icon">
                {isScam ? <AlertIcon className="bigbtn__svg" /> : <CheckIcon className="bigbtn__svg" />}
              </span>
              <span className="bigbtn__label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ---- Pick the Stronger ---- */
const PasswordBody = ({
  c,
  picked,
  onPick,
}: {
  c: ApiChallenge;
  picked: Picked | null;
  onPick: (value: string, isCorrect: boolean) => void;
}) => {
  const meta = c.metadata as PickStrongerMetadata;
  const mode = meta.mode || 'string';

  return (
    <>
      <h2 className="prompt__text prompt__text--inline">{c.prompt}</h2>
      <div className={`pwd pwd--${mode}`}>
        {meta.options.map((opt, i) => {
          const isPicked = picked?.value === opt.id;
          const lockedRight = isPicked && picked!.isCorrect;
          const lockedWrong = isPicked && !picked!.isCorrect;
          const isCorrect = opt.id === c.correct_answer;
          return (
            <button
              key={opt.id}
              className={`pwd__card pwd__card--${mode} ${isPicked ? 'is-picked' : ''} ${
                lockedRight ? 'is-right' : ''
              } ${lockedWrong ? 'is-wrong' : ''}`}
              onClick={() => onPick(opt.id, isCorrect)}
              disabled={picked !== null}
            >
              {mode === 'string' ? (
                <>
                  <div className="pwd__card-top">
                    <span className="pwd__letter">{String.fromCharCode(65 + i)}</span>
                    <PwdMeter value={opt.value || ''} weak={!!opt.weak} />
                  </div>
                  <div className="pwd__value">{opt.value}</div>
                  <div className="pwd__hint">{opt.hint}</div>
                </>
              ) : (
                <>
                  <div className="approach__top">
                    <div
                      className="approach__avatar"
                      style={{ background: opt.avatarColor }}
                    >
                      {opt.avatar}
                    </div>
                    <div>
                      <div className="approach__name">{opt.person}</div>
                      <div className="approach__hint">{opt.hint}</div>
                    </div>
                  </div>
                  <p className="approach__line">{opt.line}</p>
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

const PwdMeter = ({ value, weak }: { value: string; weak: boolean }) => {
  const len = value.length;
  const blocks = 8;
  const filled = weak ? 2 : 7;
  return (
    <div className="pwdmeter">
      <div className="pwdmeter__bars">
        {Array.from({ length: blocks }).map((_, i) => (
          <i key={i} className={i < filled ? (weak ? 'is-weak' : 'is-strong') : ''} />
        ))}
      </div>
      <span className="pwdmeter__len">{len} chars</span>
    </div>
  );
};

/* ---- Scenario / Real or AI ---- */
const ScenarioBody = ({
  c,
  picked,
  onPick,
  aiMode,
}: {
  c: ApiChallenge;
  picked: Picked | null;
  onPick: (value: string, isCorrect: boolean) => void;
  aiMode: boolean;
}) => {
  const meta = c.metadata as ScenarioMetadata;
  const hint = meta.visual_hint;

  let topIcon: React.ReactNode = null;
  if (hint === 'incoming_call_waveform') topIcon = <WaveIcon className="scenario__icon" />;
  else if (hint === 'parking_meter_qr') topIcon = <QrIcon className="scenario__icon" />;
  else if (hint === 'fb_chat') topIcon = <ChatIcon className="scenario__icon" />;
  else if (hint === 'auth_choice') topIcon = <KeyIcon className="scenario__icon" />;
  else if (hint === 'phone_with_call') topIcon = <ShieldIcon className="scenario__icon" />;
  else if (!hint && aiMode) topIcon = <WaveIcon className="scenario__icon" />;
  else if (!hint) topIcon = <ClockIcon className="scenario__icon" />;

  return (
    <div className={`scenario ${aiMode ? 'is-ai' : ''}`}>
      <div className="scenario__card">
        {topIcon && <div className="scenario__iconwrap">{topIcon}</div>}
        {aiMode && hint === 'incoming_call_waveform' && (
          <div className="scenario__waves" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <i key={i} style={{ height: `${20 + Math.abs(Math.sin(i * 1.7)) * 100}%` }} />
            ))}
          </div>
        )}
        <ScenarioAttachment hint={hint} attachmentData={meta.attachmentData} />
        <p className="scenario__prompt">{c.prompt}</p>
      </div>
      <div className="scenario__options">
        {c.options.map((opt, i) => {
          const isPicked = picked?.value === opt.id;
          const lockedRight = isPicked && picked!.isCorrect;
          const lockedWrong = isPicked && !picked!.isCorrect;
          const isCorrect = opt.id === c.correct_answer;
          return (
            <button
              key={opt.id}
              className={`opt ${isPicked ? 'is-picked' : ''} ${
                lockedRight ? 'is-right' : ''
              } ${lockedWrong ? 'is-wrong' : ''}`}
              onClick={() => onPick(opt.id, isCorrect)}
              disabled={picked !== null}
            >
              <span className="opt__letter">{String.fromCharCode(65 + i)}</span>
              <span className="opt__text">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ScenarioAttachment = ({
  hint,
  attachmentData,
}: {
  hint: ScenarioMetadata['visual_hint'];
  attachmentData?: ScenarioMetadata['attachmentData'];
}) => {
  if (hint === 'phone_with_call') return <Att2FACall />;
  if (hint === 'fb_chat' && attachmentData) return <AttFBChat data={attachmentData} />;
  if (hint === 'auth_choice') return <AttAuthChoice />;
  if (hint === 'parking_meter_qr') return <AttMeterQR />;
  return null;
};

const Att2FACall = () => (
  <div className="att att--phone">
    <div className="att-phone__notif">
      <div className="att-phone__notif-icon">
        <ShieldIcon className="att-phone__icon" />
      </div>
      <div className="att-phone__notif-body">
        <div className="att-phone__notif-from">NorthBank</div>
        <div className="att-phone__notif-text">
          Your verification code is <b>481 209</b>. Don't share it.
        </div>
      </div>
      <div className="att-phone__notif-time">now</div>
    </div>
    <div className="att-phone__call">
      <div className="att-phone__call-label">Incoming call</div>
      <div className="att-phone__call-num">+61 2 ···· ····</div>
      <div className="att-phone__call-sub">No caller ID</div>
      <div className="att-phone__call-actions">
        <span className="att-phone__btn att-phone__btn--reject">✕</span>
        <span className="att-phone__btn att-phone__btn--accept">✓</span>
      </div>
    </div>
  </div>
);

const AttFBChat = ({ data }: { data: NonNullable<ScenarioMetadata['attachmentData']> }) => (
  <div className="att att--fb">
    <div className="att-fb__head">
      <div className="att-fb__avatar" style={{ background: data.avatarColor }}>
        {data.avatar}
      </div>
      <div className="att-fb__headtext">
        <div className="att-fb__name">{data.from}</div>
        <div className="att-fb__active">Active {data.time}</div>
      </div>
      <div className="att-fb__icons">📞</div>
    </div>
    <div className="att-fb__bubble">{data.preview}</div>
  </div>
);

const AttAuthChoice = () => (
  <div className="att att--auth">
    <div className="att-auth__row">
      <div className="att-auth__chip">Security settings</div>
      <div className="att-auth__hint">Choose how you sign in</div>
    </div>
    <div className="att-auth__pill">●●●●●●●●●●●● <span>Password</span></div>
    <div className="att-auth__pill">📱 6-digit SMS <span>code</span></div>
    <div className="att-auth__pill att-auth__pill--strong">
      👆 Passkey <span>fingerprint / face</span>
    </div>
  </div>
);

const AttMeterQR = () => (
  <div className="att att--meter">
    <div className="att-meter__top">
      <div>P · $4.50/HR</div>
      <div className="att-meter__buttons">
        <i /><i /><i />
      </div>
    </div>
    <div className="att-meter__sticker" aria-label="QR sticker partially overlapping the meter signage">
      <div className="att-meter__qrwrap">
        <QRGlyph />
      </div>
      <div className="att-meter__caption">SCAN TO PAY →</div>
    </div>
    <div className="att-meter__note">Sticker doesn't line up with the rest of the signage…</div>
  </div>
);
