// ToolCall —— 产品内嵌的"已打开文档"模拟面板（不真控系统）
import { useState } from 'react';
import { TOOL_TARGETS, type ToolTargetDef } from '../../tools/handler';

interface Props {
  target: string;
  tomorrowAction: string;
  onDone: () => void;
}

export function ToolCall({ target, tomorrowAction, onDone }: Props) {
  const def: ToolTargetDef | undefined = TOOL_TARGETS[target];
  const [open, setOpen] = useState('');
  const [points, setPoints] = useState(['', '', '']);

  const allDone =
    (def?.key === 'presentation' ? open.trim() !== '' && points.every((p) => p.trim() !== '') : open.trim() !== '');

  return (
    <div className="card fade">
      <div className="toolpanel">
        <div className="bar">
          <span className="dot" style={{ background: '#ff5f57' }} />
          <span className="dot" style={{ background: '#febc2e' }} />
          <span className="dot" style={{ background: '#28c840' }} />
          <span style={{ marginLeft: 6 }}>{def?.title ?? target}</span>
        </div>

        {def?.key === 'presentation' ? (
          <>
            <div className="title">写一下明天的开场白</div>
            <div className="tool-inline">
              <input
                placeholder="开场白（一句话，例如：今天想和大家分享……）"
                value={open}
                onChange={(e) => setOpen(e.target.value)}
              />
            </div>
            <div className="title" style={{ marginTop: 6 }}>三个核心观点</div>
            <ul className="check-list">
              {points.map((p, i) => (
                <li key={i} className={p.trim() ? 'done' : ''}>
                  <span className="tick">{p.trim() ? '✓' : ''}</span>
                  <input
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#e9e7f1', fontSize: 14, outline: 'none' }}
                    placeholder={`核心观点 ${i + 1}`}
                    value={p}
                    onChange={(e) => {
                      const next = [...points];
                      next[i] = e.target.value;
                      setPoints(next);
                    }}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="tool-inline">
            <div className="title">回一封短短的邮件</div>
            <textarea
              className="input"
              style={{ minHeight: 90 }}
              placeholder="三行以内，把要说的发出去……"
              value={open}
              onChange={(e) => setOpen(e.target.value)}
            />
          </div>
        )}
      </div>

      <button className="btn primary" onClick={onDone} disabled={!allDone}>
        好了，我写完了
      </button>
      <p className="muted small" style={{ marginTop: 12 }}>
        模拟：这里假装是你电脑上的文档/邮箱。完成后不忘记录——{tomorrowAction || '明天继续'}
      </p>
    </div>
  );
}
