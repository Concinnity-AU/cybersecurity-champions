/* Main app — state machine across welcome | loading | challenge | result | thanks. */

import { useEffect, useState } from 'react';
import { Welcome } from './components/Welcome';
import { Challenge } from './components/Challenge';
import { Feedback } from './components/Feedback';
import { Result } from './components/Result';
import { ThankYou } from './components/ThankYou';
import { Header, Footer, Confetti } from './components/Chrome';
import { fetchChallenges, postComplete } from './lib/api';
import { useAutoResize } from './lib/iframe';
import type { ApiChallenge, AnswerRecord, CompleteResponse } from './lib/types';

type Stage = 'welcome' | 'loading' | 'challenge' | 'submitting' | 'result' | 'thanks' | 'error';

export const App = () => {
  const [stage, setStage] = useState<Stage>('welcome');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [answerLog, setAnswerLog] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; tip: string } | null>(null);
  const [confettiSeed, setConfettiSeed] = useState(0);
  const [scoreBump, setScoreBump] = useState(0);
  const [completion, setCompletion] = useState<CompleteResponse | null>(null);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState<number>(0);

  // Re-fire post-message on every stage / index change.
  useAutoResize(`${stage}:${idx}:${feedback ? 'f' : 'n'}`);

  const total = challenges.length;
  const currentChallenge = challenges[idx];

  const start = async () => {
    setStage('loading');
    setErrorMsg(null);
    try {
      const data = await fetchChallenges('en', 10);
      setSessionId(data.session_id);
      setChallenges(data.challenges);
      setIdx(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setAnswers([]);
      setAnswerLog([]);
      setFeedback(null);
      setCompletion(null);
      setName('');
      setStartTime(Date.now());
      setStage('challenge');
    } catch (e) {
      setErrorMsg(
        e instanceof Error
          ? `${e.message}`
          : 'Could not load challenges. Please try again.',
      );
      setStage('error');
    }
  };

  const handleAnswer = (isCorrect: boolean, answer: string, timeMs: number) => {
    const c = currentChallenge;
    setAnswers((a) => [...a, isCorrect]);
    setAnswerLog((log) => [...log, { key: c.key, answer, correct: isCorrect, timeMs }]);
    if (isCorrect) {
      setScore((s) => s + 1);
      setScoreBump((n) => n + 1);
      setStreak((s) => {
        const ns = s + 1;
        if (ns >= 3) setConfettiSeed((cs) => cs + 1);
        setMaxStreak((m) => Math.max(m, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setFeedback({ isCorrect, tip: c.explanation });
  };

  const next = async () => {
    setFeedback(null);
    if (idx + 1 >= total) {
      // Last question — submit completion before showing result screen.
      setStage('submitting');
      try {
        // By the time the user taps "See my result", React has re-rendered
        // with all answer state in place, so these closures are current.
        const duration = Math.round((Date.now() - startTime) / 1000);
        const resp = await postComplete({
          session_id: sessionId,
          score,
          total,
          max_streak: maxStreak,
          duration_seconds: duration,
          challenges_seen: challenges.map((c) => c.key),
          answers: answerLog,
          language: 'en',
        });
        setCompletion(resp);
        setStage('result');
      } catch (e) {
        // If completion submit fails, still show the result screen — better
        // UX than blocking the user on an analytics call.
        setCompletion({
          completion_id: 0,
          session_id: sessionId,
          tier: 'aware',
          share_url: window.location.origin,
          og_image_url: '',
        });
        setStage('result');
      }
    } else {
      setIdx((i) => i + 1);
    }
  };

  const submitLead = (firstName: string) => {
    setName(firstName);
    setStage('thanks');
  };

  const restart = () => {
    setStage('welcome');
    setIdx(0);
    setScore(0);
    setAnswers([]);
    setStreak(0);
    setMaxStreak(0);
    setName('');
    setCompletion(null);
  };

  const showHeader = stage === 'challenge';

  return (
    <div className="cc-root">
      <div className="cc-shell">
        {showHeader && currentChallenge && (
          <Header
            idx={idx}
            total={total}
            score={score}
            streak={streak}
            scoreBump={scoreBump}
          />
        )}

        <div className="cc-content">
          {stage === 'welcome' && <Welcome onStart={start} />}
          {(stage === 'loading' || stage === 'submitting') && (
            <div className="loading">
              <div className="loading__spinner" />
              <p>{stage === 'loading' ? 'Loading challenges…' : 'Tallying your score…'}</p>
            </div>
          )}
          {stage === 'error' && (
            <div className="error-state">
              <h2>Something went wrong</h2>
              <p>{errorMsg}</p>
              <button className="btn btn--primary" onClick={start}>Try again</button>
            </div>
          )}
          {stage === 'challenge' && currentChallenge && (
            <Challenge
              key={currentChallenge.key}
              challenge={currentChallenge}
              onAnswer={handleAnswer}
            />
          )}
          {stage === 'result' && (
            <Result total={total} sessionId={sessionId} onSubmit={submitLead} />
          )}
          {stage === 'thanks' && completion && (
            <ThankYou
              name={name}
              score={score}
              total={total}
              answers={answers}
              sessionId={sessionId}
              shareUrl={completion.share_url}
              onRestart={restart}
            />
          )}
        </div>

        {feedback && (
          <Feedback
            isCorrect={feedback.isCorrect}
            tip={feedback.tip}
            onNext={next}
            isLast={idx + 1 >= total}
          />
        )}

        {confettiSeed > 0 && <Confetti seed={confettiSeed} />}

        <Footer />
      </div>
    </div>
  );
};
