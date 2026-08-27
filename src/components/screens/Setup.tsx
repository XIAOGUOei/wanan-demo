// Setup —— 首次设置：直接选「今天结束的时间」和「睡觉时间」两个时间
import { useState } from 'react';
import type { SleepSettings } from '../../types';

interface Props {
  initial: SleepSettings;
  onSave: (s: SleepSettings) => void;
  onBack?: () => void;
}

export function Setup({ initial, onSave, onBack }: Props) {
  // 显式收尾/结束今天时间，缺省由 sleepTime - leadMinutes 推定
  const [winddownTime, setWinddownTime] = useState(initial.winddownTime || '22:30');
  const [sleepTime, setSleepTime] = useState(initial.sleepTime || '23:00');

  const save = () => {
    onSave({ sleepTime, leadMinutes: 30, winddownTime });
  };

  return (
    <div className="card fade">
      <span className="emoji">🌙</span>
      <h2 className="big mb">先了解一下你的习惯</h2>
      <p className="muted mb">
        每个人的作息不一样，什么时候放下手机、什么时候睡，由你自己决定。
      </p>

      <div className="setting-line">
        <div className="setting-label">几点想开始结束今天？</div>
        <input
          type="time"
          value={winddownTime}
          onChange={(e) => setWinddownTime(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.25)', color: '#cdd3ff', fontSize: 18 }}
        />
      </div>

      <div className="setting-line">
        <div className="setting-label">几点想睡觉？</div>
        <input
          type="time"
          value={sleepTime}
          onChange={(e) => setSleepTime(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.25)', color: '#cdd3ff', fontSize: 18 }}
        />
      </div>

      <div className="compute">
        <span>结束今天 <b>{winddownTime}</b></span>
        <span>睡觉 <b>{sleepTime}</b></span>
      </div>

      <button className="btn primary" onClick={save}>就这样开始 🚀</button>
      {onBack && (
        <button className="btn ghost" onClick={onBack} style={{ marginTop: 10, width: '100%' }}>
          ← 返回
        </button>
      )}
    </div>
  );
}
