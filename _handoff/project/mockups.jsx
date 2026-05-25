/* Mockups for "Spot It" challenges — generic phone/email/chat chrome.
   Brand names appear only in scam TEXT, never as recreated logos. */

const SMSMockup = ({ data }) => {
  const { sender, senderNote, time, bubbles, verified } = data;
  return (
    <div className="device device--phone">
      <div className="device__notch" />
      <div className="device__statusbar">
        <span>{time}</span>
        <span className="device__icons">
          <span className="bars"><i/><i/><i/><i/></span>
          <span className="batt"><i/></span>
        </span>
      </div>
      <div className="sms__header">
        <button className="sms__back" aria-hidden="true">‹</button>
        <div className="sms__senderwrap">
          <div className={`sms__avatar ${verified ? 'is-verified' : 'is-unknown'}`}>
            {verified ? '✓' : '?'}
          </div>
          <div className="sms__sendertext">
            <div className="sms__sender">{sender}</div>
            <div className="sms__sub">{senderNote}</div>
          </div>
        </div>
      </div>
      <div className="sms__thread">
        <div className="sms__time">Today {time}</div>
        {bubbles.map((b, i) => (
          <div key={i} className="sms__bubble">
            <BubbleText text={b.text} />
            {b.qr && <QRGlyph />}
          </div>
        ))}
      </div>
    </div>
  );
};

/* WhatsApp-style chat: unknown number, default avatar, several bubbles */
const ChatMockup = ({ data }) => {
  const { sender, senderNote, time, bubbles } = data;
  return (
    <div className="device device--phone">
      <div className="device__notch" />
      <div className="device__statusbar">
        <span>{time}</span>
        <span className="device__icons">
          <span className="bars"><i/><i/><i/><i/></span>
          <span className="batt"><i/></span>
        </span>
      </div>
      <div className="chat__header">
        <button className="sms__back" aria-hidden="true">‹</button>
        <div className="chat__senderwrap">
          <div className="chat__avatar" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <circle cx="16" cy="16" r="16" fill="#cfcabe" />
              <circle cx="16" cy="13" r="5" fill="#fff" />
              <path d="M6 28c1.5-5.5 5.5-8 10-8s8.5 2.5 10 8" fill="#fff" />
            </svg>
          </div>
          <div className="chat__sendertext">
            <div className="chat__sender">{sender}</div>
            <div className="chat__sub">{senderNote}</div>
          </div>
        </div>
      </div>
      <div className="chat__thread">
        <div className="chat__day">TODAY</div>
        {bubbles.map((b, i) => (
          <div key={i} className="chat__bubble">
            <BubbleText text={b.text} />
            <span className="chat__time">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BubbleText = ({ text }) => (
  <>
    {text.split('\n').map((line, i, arr) => (
      <p key={i}>
        {line}
        {i < arr.length - 1 && <br aria-hidden="true" />}
      </p>
    ))}
  </>
);

const QRGlyph = () => (
  <div className="qrglyph" aria-label="QR code">
    <svg viewBox="0 0 21 21" width="84" height="84" shapeRendering="crispEdges" role="img">
      {(() => {
        const cells = [];
        const seed = (x, y) => ((x*13 + y*7 + x*y) % 5 === 0) || ((x+y)%6===1);
        for (let y = 0; y < 21; y++) {
          for (let x = 0; x < 21; x++) {
            const inFinder = ((x<7 && y<7) || (x>13 && y<7) || (x<7 && y>13));
            let fill = false;
            if (inFinder) {
              const fx = x>13 ? x-14 : x;
              const fy = y>13 ? y-14 : y;
              fill = (fx===0||fx===6||fy===0||fy===6) || (fx>=2&&fx<=4&&fy>=2&&fy<=4);
            } else {
              fill = seed(x,y);
            }
            if (fill) cells.push(<rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />);
          }
        }
        return cells;
      })()}
    </svg>
  </div>
);

const EmailMockup = ({ data }) => {
  const { fromName, fromAddr, avatarLetter, avatarColor, subject, body, cta, sign } = data;
  return (
    <div className="device device--mail">
      <div className="mail__chrome">
        <span className="mail__chip">Inbox</span>
        <span className="mail__chrome-spacer" />
        <span className="mail__chrome-dots">⋯</span>
      </div>
      <div className="mail__head">
        <div className="mail__subject">{subject}</div>
        <div className="mail__fromrow">
          <div className="mail__senderdot" style={{ background: avatarColor || 'var(--con-orange)' }}>
            {avatarLetter || 'A'}
          </div>
          <div className="mail__fromtext">
            <div className="mail__fromname">{fromName}</div>
            <div className="mail__fromaddr">{fromAddr}</div>
          </div>
          <div className="mail__time">Today</div>
        </div>
      </div>
      <div className="mail__body">
        {body.map((line, i) => <BubbleText key={i} text={line} />)}
        {cta && (
          <div className="mail__cta-wrap">
            <button className="mail__cta" type="button" tabIndex="-1">{cta.label}</button>
            <div className="mail__cta-url">link: {cta.url}</div>
          </div>
        )}
        {sign && sign.map((line, i) => <p key={i} className="mail__sign">{line}</p>)}
      </div>
    </div>
  );
};

const Mockup = ({ data }) => {
  if (data.kind === 'sms')   return <SMSMockup data={data} />;
  if (data.kind === 'chat')  return <ChatMockup data={data} />;
  if (data.kind === 'email') return <EmailMockup data={data} />;
  return null;
};

Object.assign(window, { Mockup, SMSMockup, ChatMockup, EmailMockup });
