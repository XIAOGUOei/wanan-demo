// BedtimeTrigger —— 进入睡前流程的主动介入
import { useState } from 'react';

interface Props {
  clock: string;
  onSubmit: (text: string) => void;
  onSkip: () => void;
}

export function BedtimeTrigger({ clock, onSubmit, onSkip }: Props) {
  const [text, setText] = useState('');

  const submit = () => onSubmit(text.trim());

  return (
    <div className="card fade">
      <div className="clock">{clock}</div>
      <div className="clock-label">现在</div>

      <div style={{ height: 18 }} />
      <span className="emoji">🌙</span>
      <h2 className="big mb">该准备结束今天了</h2>
      <p className="muted mb">
        现在是放下手机、好好结束今天的时刻。<br />
        还有什么事情，让你放不下吗？
      </p>

      <textarea
        className="input"
        placeholder="我还在想……"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) submit();
          }
        }}
      />
      <button className="btn primary" onClick={submit} disabled={!text.trim()}>我还有事情没做完</button>
      <button className="btn ghost" onClick={onSkip}>没什么事情了</button>
    </div>
  );
}
