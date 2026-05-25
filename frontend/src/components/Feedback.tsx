import { ArrowIcon, CheckIcon, CrossIcon } from './Icon';
import { STRINGS } from '../lib/strings';

interface FeedbackProps {
  isCorrect: boolean;
  tip: string;
  onNext: () => void;
  isLast: boolean;
}

export const Feedback = ({ isCorrect, tip, onNext, isLast }: FeedbackProps) => (
  <div className="feedback" role="dialog" aria-modal="true">
    <div className={`feedback__card ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
      <div className="feedback__verdict">
        <div className="feedback__badge">
          {isCorrect ? <CheckIcon className="feedback__badge-icon" /> : <CrossIcon className="feedback__badge-icon" />}
        </div>
        <div>
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
        {isLast ? 'See my result' : STRINGS.nextLabel}
        <ArrowIcon className="btn__icon" />
      </button>
    </div>
  </div>
);
