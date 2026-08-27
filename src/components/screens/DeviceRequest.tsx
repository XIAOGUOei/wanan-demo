// DeviceRequest —— 睡前的设备操作类请求（闹钟 / 勿扰）内嵌模拟面板
// 设计：把"用户睡前想定个闹钟 / 开个勿扰"当成一个独立小操作来响应，
// 而不是误判为"未完成的任务"或"不想睡"。这里用内嵌面板模拟，不真正控制系统。
import { useState } from 'react';

interface Props {
  target: string; // 'alarm' | 'silent'
  tomorrowAction: string;
  onDone: () => void;
}

export function DeviceRequest({ target, tomorrowAction, onDone }: Props) {
  const isAlarm = target === 'alarm';
  const [time, setTime] = useState('07:00');
  const [silentUntil, setSilentUntil] = useState(true);

  const ready = isAlarm ? time !== '' : silentUntil;

  return (
    <div className="card fade">
      <span className="emoji">⏰</span>
      <h2 className="big mb">{isAlarm ? '设一个明早的闹钟' : '开启勿扰模式'}</h2>
      <p className="muted mb">
        好，这个我来帮你。{isAlarm ? '你想几点起床？' : '我把通知静音，直到你明早起来。'}
      </p>

      <div className="toolpanel">
        <div className="bar">
          <span className="dot" style={{ background: '#ff5f57' }} />
          <span className="dot" style={{ background: '#febc2e' }} />
          <span className="dot" style={{ background: '#28c840' }} />
          <span style={{ marginLeft: 6 }}>{isAlarm ? '闹钟 · 设置' : '勿扰模式'}</span>
        </div>

        {isAlarm ? (
          <div className="tool-inline">
            <div className="title">起床时间</div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: '100%', padding: '12px', margin: '8px 0 6px', font: 'inherit',
                color: '#cdd3ff', background: 'rgba(0,0,0,.25)',
                border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
              }}
            />
          </div>
        ) : (
          <div className="tool-inline">
            <div className="title">勿扰模式</div>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 2px', fontSize: 15 }}
            >
              <input
                type="checkbox"
                checked={silentUntil}
                onChange={(e) => setSilentUntil(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              开启，直到明早
            </label>
          </div>
        )}
      </div>

      <button className="btn primary" onClick={onDone} disabled={!ready}>
        {isAlarm ? '好了，设好了' : '好了，开启勿扰'}
      </button>
      <p className="muted small" style={{ marginTop: 12 }}>
        模拟：这里假装是你系统里的闹钟 / 勿扰开关。演示时不真正调用设备。
        {tomorrowAction ? ` —— ${tomorrowAction}` : ''}
      </p>
    </div>
  );
}
