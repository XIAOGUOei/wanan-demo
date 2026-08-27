// MiniAction —— 找到"今晚最后一个最小动作"
import type { AnalysisResult } from '../../types';
import { needsOpenDocument, TOOL_TARGETS } from '../../tools/handler';

interface Props {
  analysis: AnalysisResult;
  onOpenDoc: () => void;
  onComplete: () => void;
}

export function MiniAction({ analysis, onOpenDoc, onComplete }: Props) {
  const showDoc = needsOpenDocument(analysis.action_type);
  const docTitle =
    analysis.target && TOOL_TARGETS[analysis.target]
      ? TOOL_TARGETS[analysis.target].title
      : '文档';

  return (
    <div className="card fade">
      <span className="emoji">🪄</span>
      <h2 className="big mb">今晚，只做最后一小步</h2>
      <p className="muted mb">
        今晚不用把整件事做完。我们只完成一个动作：
      </p>
      <div style={{ background: 'rgba(141,155,255,.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 6 }}>
        <div style={{ fontSize: 17, lineHeight: 1.5 }}>{analysis.tonight_action}</div>
        <div className="dim small" style={{ marginTop: 8 }}>
          预计约 {analysis.estimated_minutes} 分钟
        </div>
      </div>

      <p className="muted small mb" style={{ marginTop: 12 }}>
        做完这一步，心里那件事就算暂时放下了。
      </p>

      {showDoc ? (
        <button className="btn primary" onClick={onOpenDoc}>打开 {docTitle}</button>
      ) : (
        <button className="btn primary" onClick={onComplete}>好了，我做完了</button>
      )}
    </div>
  );
}
