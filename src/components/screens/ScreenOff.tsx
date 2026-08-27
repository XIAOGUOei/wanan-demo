// ScreenOff —— 用户选择"直接放下手机/今天就到这里"后的模拟熄屏
// 说明：这是网页 demo，不能真正灭掉系统屏幕；这里用全屏黑色模拟"熄屏"，
// 并提供一个"点亮屏幕"按钮（演示用）继续到第二天。
interface Props {
  onWake: () => void;
}

export function ScreenOff({ onWake }: Props) {
  return (
    <div
      className="screen-off"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        color: '#2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        zIndex: 999,
      }}
    >
      <div className="clock" style={{ color: '#3a3a3a', fontSize: 34 }}>
        💤
      </div>
      <p style={{ margin: 0, fontSize: 15, letterSpacing: 1 }}>屏幕已熄灭 · 今晚就到这里</p>
      <button
        className="btn ghost"
        onClick={onWake}
        style={{ marginTop: 24, color: '#555', borderColor: 'rgba(255,255,255,.12)' }}
      >
        点亮屏幕（演示进入第二天）
      </button>
      <p className="muted small" style={{ color: '#333', marginTop: 8 }}>
        演示：网页无法真正关闭屏幕，这里用黑色界面模拟熄屏。
      </p>
    </div>
  );
}
