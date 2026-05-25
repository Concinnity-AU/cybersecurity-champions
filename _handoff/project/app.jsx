/* Main app — manages state machine and global chrome (header / progress / confetti / streak) */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const App = () => {
  const [stage, setStage] = useStateA('welcome'); // welcome | challenge | result | thanks
  const [idx, setIdx] = useStateA(0);
  const [score, setScore] = useStateA(0);
  const [answers, setAnswers] = useStateA([]); // bool[]
  const [streak, setStreak] = useStateA(0);
  const [feedback, setFeedback] = useStateA(null); // { isCorrect, tip }
  const [confettiSeed, setConfettiSeed] = useStateA(0);
  const [name, setName] = useStateA('');
  const [scoreBump, setScoreBump] = useStateA(0);

  const total = CHALLENGES.length;

  const start = () => {
    setIdx(0);setScore(0);setAnswers([]);setStreak(0);setFeedback(null);
    setStage('challenge');
  };

  const handleAnswer = (isCorrect) => {
    const c = CHALLENGES[idx];
    setAnswers((a) => [...a, isCorrect]);
    if (isCorrect) {
      setScore((s) => s + 1);
      setScoreBump((n) => n + 1);
      setStreak((s) => {
        const ns = s + 1;
        if (ns >= 3) setConfettiSeed((cs) => cs + 1);
        return ns;
      });
    } else {
      setStreak(0);
    }
    setFeedback({ isCorrect, tip: c.tip });
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= total) {
      setStage('result');
    } else {
      setIdx((i) => i + 1);
    }
  };

  const submitLead = (form) => {
    setName(form.firstName);
    setStage('thanks');
  };

  const restart = () => {setStage('welcome');setIdx(0);setScore(0);setAnswers([]);setStreak(0);setName('');};

  // Header chrome only on challenge — score is gated on result, thanks has its own reveal
  const showChrome = stage === 'challenge';

  return (
    <div className="cc-root">
      <div className="cc-shell">
        {showChrome &&
        <Header
          idx={idx}
          total={total}
          score={score}
          streak={streak}
          scoreBump={scoreBump}
          stage={stage} />

        }

        <div className="cc-content">
          {stage === 'welcome' && <Welcome onStart={start} />}
          {stage === 'challenge' &&
          <Challenge
            key={CHALLENGES[idx].id}
            challenge={CHALLENGES[idx]}
            index={idx}
            total={total}
            onAnswer={handleAnswer} />

          }
          {stage === 'result' && <Result total={total} onSubmit={submitLead} />}
          {stage === 'thanks' && <ThankYou name={name} score={score} total={total} answers={answers} onRestart={restart} />}
        </div>

        {feedback &&
        <Feedback
          isCorrect={feedback.isCorrect}
          tip={feedback.tip}
          onNext={next}
          isLast={idx + 1 >= total} />

        }

        {confettiSeed > 0 && <Confetti seed={confettiSeed} />}

        <Footer />
      </div>
    </div>);

};

/* Header: progress dots + score + streak */
const Header = ({ idx, total, score, streak, scoreBump, stage }) => {
  return (
    <header className="hdr">
      <div className="hdr__left">
        <img src="assets/tims-sun.png" alt="" className="hdr__sun" width="32" height="32" />
        <span className="hdr__title">Champions Challenge</span>
      </div>
      <div className="hdr__right">
        {streak >= 2 &&
        <div className="streak" key={streak}>
            {Icon.flame('streak__icon')}
            <span>{STRINGS.streakLabel(streak)}</span>
          </div>
        }
        <div className="score" key={`s-${scoreBump}`}>
          <span className="score__label">{STRINGS.scoreLabel}</span>
          <span className="score__value">{score}<span className="score__total">/{total}</span></span>
        </div>
      </div>

      {stage === 'challenge' &&
      <div className="dots" aria-label={`Question ${idx + 1} of ${total}`}>
          {Array.from({ length: total }).map((_, i) =>
        <span key={i} className={`dot ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`} />
        )}
        </div>
      }
    </header>);

};

/* Footer with both logos and FREE chip */
const Footer = () =>
<footer className="ftr">
    <div className="ftr__free">
      <span className="ftr__free-chip">FREE</span>
      <span>A community program by</span>
    </div>
    <div className="ftr__logos">
      <div className="ftr__logo">
        <img src="assets/tims-banner.png" alt="Toowoomba International Multicultural Society" />
      </div>
      <span className="ftr__sep">·</span>
      <div className="ftr__logo ftr__logo--concinnity">
        <img src="assets/concinnity-mark.png" alt="" />
        <span className="ftr__logo-text" style={{ fontFamily: "Comfortaa" }}>Concinnity</span>
      </div>
    </div>
  </footer>;


/* Confetti: absolute within container, NOT fixed */
const Confetti = ({ seed }) => {
  const pieces = Array.from({ length: 32 }).map((_, i) => {
    const left = (Math.sin(seed * 7.1 + i * 1.3) * 0.5 + 0.5) * 100;
    const delay = i % 8 * 60;
    const duration = 1400 + i % 5 * 220;
    const colors = ['var(--accent-gold)', 'var(--accent-orange)', 'var(--accent-red)', 'var(--accent-purple)', 'var(--accent-green)'];
    const c = colors[i % colors.length];
    const rot = i * 37 % 360;
    return (
      <span key={`${seed}-${i}`} className="confetti__piece"
      style={{
        left: `${left}%`,
        background: c,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        transform: `rotate(${rot}deg)`
      }} />);


  });
  return <div className="confetti" aria-hidden="true" key={seed}>{pieces}</div>;
};

window.App = App;
ReactDOM.createRoot(document.getElementById('root')).render(<App />);