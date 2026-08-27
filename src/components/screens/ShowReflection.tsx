// ShowReflection —— 用户只是舍不得结束今天，结合历史反馈
import type { AnalysisResult, HistoryEntry } from '../../types';
import { buildReflectionMessage } from '../../state/history';

interface Props {
  analysis: AnalysisResult;
  history: HistoryEntry[];
  onEnd: () => void; // 今天就到这里 → 直接熄屏
  onContinue: () => void;
}

export function ShowReflection({ analysis, history, onEnd, onContinue }: Props) {
  const reflection = analysis.reassurance || buildReflectionMessage(history);

  return (
    <div className="card fade">
      <span className="emoji">🌑</span>
      <h2 className="big mb">我懂。</h2>
      <p className="muted mb">
        你可能不是还有事情没做完，只是还不太想结束今天。
      </p>
      <div style={{ background: 'rgba(141,155,255,.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 6 }}>
        <p className="muted" style={{ margin: 0 }}>{reflection}</p>
      </div>
      <button className="btn primary" onClick={onEnd}>今天就到这里 · 放下手机</button>
      <button className="btn ghost" onClick={onContinue}>我还是想继续</button>
    </div>
  );
}
