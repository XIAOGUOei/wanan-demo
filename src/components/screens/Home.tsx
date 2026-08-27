// Home —— 主页面 / 白天或空闲状态，含 Demo 时控与历史
import type { HistoryEntry, SleepSettings } from '../../types';
import { computeWinddown } from '../../state/storage';

interface Props {
  settings: SleepSettings;
  history: HistoryEntry[];
  onEnterBedtime: () => void;
  onStartNewDay: () => void;
  onOpenSettings: () => void;
}

export function Home({ settings, history, onEnterBedtime, onStartNewDay, onOpenSettings }: Props) {
  const winddown = computeWinddown(settings);
  const last = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="fade">
      <div className="card">
        <span className="emoji">🏠</span>
        <h2 className="big mb">晚上好</h2>
        <p className="muted mb">
          你计划在 <b style={{ color: '#cdd3ff' }}>{winddown}</b> 开始结束今天，{' '}
          <b style={{ color: '#cdd3ff' }}>{settings.sleepTime}</b> 睡觉。
        </p>
        <p className="muted mb small">
          到时间我会来问问你：还有没有什么放不下的？
        </p>
        <button className="btn primary" onClick={onEnterBedtime}>
          模拟：现在进入结束今天的流程（{winddown}）
        </button>
        <button className="btn secondary" onClick={onStartNewDay}>模拟：第二天 · 开始今天</button>
        <button
          className="btn ghost"
          onClick={onOpenSettings}
          style={{ marginTop: 10, width: '100%' }}
        >
          ⚙️ 修改结束时间 / 睡觉时间
        </button>
      </div>

      {last && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="title mb">最近记录</div>
          {history.slice(-4).reverse().map((h) => (
            <div className="hist-row" key={h.date + h.endTime}>
              <span className="dim">{h.date}</span>
              <span>{h.endTime} 结束</span>
              <span>{h.mood === 'tired' ? '😴' : h.mood === 'ok' ? '🙂' : '⚡'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
