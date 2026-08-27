// EndChoice —— 统一的"结束选择"屏：多个分支（没什么事 / 定闹钟好了 / 任务完成 / …）在这里汇总
// 给用户两个选择：今天就到这里（直接熄屏）或 再等等。
// 选"再等等"时，用 TA 自己的历史数据温和地确认一次，然后才放行。
import { useState, type ReactNode } from 'react';
import type { HistoryEntry } from '../../types';
import { MOOD_LABEL } from '../../types';

interface Props {
  context: string; // 模块相关的引导语（如 "好像没什么放心不下的了" / "闹钟已经帮你设好了"）
  intro?: ReactNode; // 可选：个性化说明，显示在引导问句之前（如"明天第一件事…现在，不用再处理它了。"）
  history: HistoryEntry[];
  onEnd: () => void; // 选"就到这里/还是结束吧" → 直接熄屏
  onContinue: () => void; // "我再看看" → CONTINUE
}

// 把 "2026-08-24 / 00:49 / tired" 显示成可读的一行
function formatEntry(h: HistoryEntry): string {
  const d = h.date.slice(5); // MM-DD
  const mood = MOOD_LABEL[h.mood] ?? h.mood;
  return `你 ${d} 在 ${h.endTime} 结束，第二天 ${mood}`;
}

const PENDING_NOTE = '晚睡那晚，第二天都记录为「有点困」。';

export function EndChoice({ context, intro, history, onEnd, onContinue }: Props) {
  const [confirming, setConfirming] = useState(false);
  const recent = history.slice(-3).reverse();
  const anyTired = history.some((h) => h.mood === 'tired');

  if (!confirming) {
    return (
      <div className="card fade">
        <span className="emoji">🍃</span>
        <h2 className="big mb">{context}</h2>
        {intro && <p className="muted mb">{intro}</p>}
        <p className="muted mb">今晚就到这里，还是要再等等？</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <button className="btn primary" onClick={onEnd}>
            💤 今天就到这里 · 放下手机（直接熄屏）
          </button>
          <button className="btn ghost" onClick={() => setConfirming(true)}>
            🕒 再等等
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade">
      <span className="emoji">🕒</span>
      <h2 className="big mb">想再等等？</h2>
      <p className="muted mb">先看看你之前几晚是怎么结束的：</p>
      <div className="hl" style={{ padding: '10px 14px' }}>
        {recent.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>这还是你的第一晚，没有任何历史记录。</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            {recent.map((h, i) => (
              <li key={h.date + i} style={{ fontSize: 14, color: '#cdd3ff' }}>
                {formatEntry(h)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {anyTired && (
        <p className="muted small mb" style={{ marginTop: 10 }}>
          {PENDING_NOTE}
        </p>
      )}
      <p className="muted mb" style={{ marginTop: 8 }}>
        真的要再等等吗？
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn primary" onClick={onEnd}>
          嗯，还是结束吧（熄屏）
        </button>
        <button className="btn ghost" onClick={onContinue}>
          是的，我再看看
        </button>
      </div>
    </div>
  );
}
