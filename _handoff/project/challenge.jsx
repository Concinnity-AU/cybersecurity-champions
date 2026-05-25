/* Challenge screens + feedback overlay */
const { useState: useStateC, useEffect: useEffectC } = React;

const Challenge = ({ challenge, index, total, onAnswer }) => {
  const [picked, setPicked] = useStateC(null);

  const handlePick = (value, isCorrect) => {
    if (picked !== null) return;
    setPicked({ value, isCorrect });
    setTimeout(() => onAnswer(isCorrect), 500);
  };

  useEffectC(() => { setPicked(null); }, [challenge.id]);

  return (
    <div className="screen challenge" data-type={challenge.type}>
      <div className="prompt">
        {challenge.type === 'spot'     && <TypeChip kind="spot">Spot it</TypeChip>}
        {challenge.type === 'password' && <TypeChip kind="password">Pick the stronger</TypeChip>}
        {challenge.type === 'scenario' && <TypeChip kind="scenario">What do you do?</TypeChip>}
        {challenge.type === 'ai'       && <TypeChip kind="ai">Real or AI?</TypeChip>}
        {challenge.type === 'spot' && (
          <h2 className="prompt__text">{challenge.prompt}</h2>
        )}
      </div>

      {challenge.type === 'spot'     && <SpotItBody     c={challenge} picked={picked} onPick={handlePick} />}
      {challenge.type === 'password' && <PasswordBody   c={challenge} picked={picked} onPick={handlePick} />}
      {challenge.type === 'scenario' && <ScenarioBody   c={challenge} picked={picked} onPick={handlePick} />}
      {challenge.type === 'ai'       && <ScenarioBody   c={challenge} picked={picked} onPick={handlePick} aiMode />}
    </div>
  );
};

const TypeChip = ({ kind, children }) => (
  <span className={`typechip typechip--${kind}`}>{children}</span>
);

/* ---- Spot It ---- */
const SpotItBody = ({ c, picked, onPick }) => {
  const isPicked = (val) => picked && picked.value === val;
  const lockedWrong = (val) => picked && picked.value === val && !picked.isCorrect;
  const lockedRight = (val) => picked && picked.value === val && picked.isCorrect;

  return (
    <div className="spot">
      <div className="spot__mockup">
        <Mockup data={c.mockup} />
      </div>
      <div className="spot__buttons">
        <button
          className={`bigbtn bigbtn--scam ${isPicked('scam') ? 'is-picked' : ''} ${lockedRight('scam') ? 'is-right' : ''} ${lockedWrong('scam') ? 'is-wrong' : ''}`}
          onClick={() => onPick('scam', c.answer === 'scam')}
          disabled={picked !== null}
        >
          <span className="bigbtn__icon">{Icon.alert('bigbtn__svg')}</span>
          <span className="bigbtn__label">Scam</span>
        </button>
        <button
          className={`bigbtn bigbtn--legit ${isPicked('legit') ? 'is-picked' : ''} ${lockedRight('legit') ? 'is-right' : ''} ${lockedWrong('legit') ? 'is-wrong' : ''}`}
          onClick={() => onPick('legit', c.answer === 'legit')}
          disabled={picked !== null}
        >
          <span className="bigbtn__icon">{Icon.check('bigbtn__svg')}</span>
          <span className="bigbtn__label">Legit</span>
        </button>
      </div>
    </div>
  );
};

/* ---- Pick the Stronger ---- */
const PasswordBody = ({ c, picked, onPick }) => {
  const mode = c.mode || 'string';
  return (
    <>
      <h2 className="prompt__text prompt__text--inline">{c.prompt}</h2>
      <div className={`pwd pwd--${mode}`}>
        {c.options.map((opt, i) => {
          const isPicked = picked && picked.value === i;
          const lockedRight = isPicked && picked.isCorrect;
          const lockedWrong = isPicked && !picked.isCorrect;
          return (
            <button
              key={i}
              className={`pwd__card pwd__card--${mode} ${isPicked ? 'is-picked' : ''} ${lockedRight ? 'is-right' : ''} ${lockedWrong ? 'is-wrong' : ''}`}
              onClick={() => onPick(i, i === c.answer)}
              disabled={picked !== null}
            >
              {mode === 'string' ? (
                <>
                  <div className="pwd__card-top">
                    <span className="pwd__letter">{String.fromCharCode(65+i)}</span>
                    <PwdMeter value={opt.value} weak={opt.weak} />
                  </div>
                  <div className="pwd__value">{opt.value}</div>
                  <div className="pwd__hint">{opt.hint}</div>
                </>
              ) : (
                <>
                  <div className="approach__top">
                    <div className="approach__avatar" style={{ background: opt.avatarColor }}>
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

const PwdMeter = ({ value, weak }) => {
  const len = value.length;
  const blocks = 8;
  const filled = weak ? 2 : 7;
  return (
    <div className="pwdmeter">
      <div className="pwdmeter__bars">
        {Array.from({length: blocks}).map((_, i) => (
          <i key={i} className={i < filled ? (weak ? 'is-weak' : 'is-strong') : ''} />
        ))}
      </div>
      <span className="pwdmeter__len">{len} chars</span>
    </div>
  );
};

/* ---- Scenario / Real or AI ---- */
const ScenarioBody = ({ c, picked, onPick, aiMode }) => {
  return (
    <div className={`scenario ${aiMode ? 'is-ai' : ''}`}>
      <div className="scenario__card">
        {(c.icon || aiMode) && (
          <div className="scenario__iconwrap">
            {c.icon === 'wave'  && Icon.wave('scenario__icon')}
            {c.icon === 'qr'    && Icon.qr('scenario__icon')}
            {c.icon === 'key'   && Icon.key('scenario__icon')}
            {c.icon === 'chat'  && Icon.chat('scenario__icon')}
            {c.icon === 'clock' && Icon.clock('scenario__icon')}
          </div>
        )}
        {aiMode && c.icon === 'wave' && (
          <div className="scenario__waves" aria-hidden="true" data-comment-anchor="b32f16db8a-div-127-11">
            {Array.from({length:24}).map((_, i) => (
              <i key={i} style={{ height: `${20 + Math.abs(Math.sin(i*1.7))*100}%` }} />
            ))}
          </div>
        )}
        <ScenarioAttachment c={c} />
        <p className="scenario__prompt">{c.prompt}</p>
      </div>
      <div className="scenario__options">
        {c.options.map((opt, i) => {
          const isPicked = picked && picked.value === i;
          const lockedRight = isPicked && picked.isCorrect;
          const lockedWrong = isPicked && !picked.isCorrect;
          return (
            <button
              key={i}
              className={`opt ${isPicked ? 'is-picked' : ''} ${lockedRight ? 'is-right' : ''} ${lockedWrong ? 'is-wrong' : ''}`}
              onClick={() => onPick(i, i === c.answer)}
              disabled={picked !== null}
            >
              <span className="opt__letter">{String.fromCharCode(65+i)}</span>
              <span className="opt__text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ---- Scenario attachments: visual props for specific challenges ---- */
const ScenarioAttachment = ({ c }) => {
  if (!c.attachment) return null;
  if (c.attachment === '2fa_call') return <Att2FACall />;
  if (c.attachment === 'fb_chat')  return <AttFBChat data={c.attachmentData} />;
  if (c.attachment === 'authchoice') return <AttAuthChoice />;
  if (c.attachment === 'meter_qr')   return <AttMeterQR />;
  return null;
};

const Att2FACall = () => (
  <div className="att att--phone">
    <div className="att-phone__notif">
      <div className="att-phone__notif-icon">{Icon.shield('att-phone__icon')}</div>
      <div className="att-phone__notif-body">
        <div className="att-phone__notif-from">NorthBank</div>
        <div className="att-phone__notif-text">Your verification code is <b>481 209</b>. Don't share it.</div>
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

const AttFBChat = ({ data }) => (
  <div className="att att--fb">
    <div className="att-fb__head">
      <div className="att-fb__avatar" style={{ background: data.avatarColor }}>{data.avatar}</div>
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
    <div className="att-auth__pill att-auth__pill--strong">👆 Passkey <span>fingerprint / face</span></div>
  </div>
);

const AttMeterQR = () => (
  <div className="att att--meter">
    <div className="att-meter__top">
      <div className="att-meter__display">P · $4.50/HR</div>
      <div className="att-meter__buttons">
        <i/><i/><i/>
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

/* ---- Feedback overlay ---- */
const Feedback = ({ isCorrect, tip, onNext, isLast }) => {
  return (
    <div className="feedback" role="dialog" aria-modal="true">
      <div className={`feedback__card ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
        <div className="feedback__verdict">
          <div className="feedback__badge">
            {isCorrect ? Icon.check('feedback__badge-icon') : Icon.cross('feedback__badge-icon')}
          </div>
          <div className="feedback__verdict-text">
            <div className="feedback__verdict-headline">
              {isCorrect ? STRINGS.correct : STRINGS.incorrect}
            </div>
            <div className="feedback__verdict-sub">
              {isCorrect ? "That's the right move." : "Here's what to watch for next time."}
            </div>
          </div>
        </div>
        <div className="feedback__tip">
          <div className="feedback__tip-label">Why</div>
          <p>{tip}</p>
        </div>
        <button className="btn btn--primary btn--lg feedback__next" onClick={onNext} autoFocus>
          {isLast ? "See my result" : "Next"}
          {Icon.arrow('btn__icon')}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { Challenge, Feedback });
