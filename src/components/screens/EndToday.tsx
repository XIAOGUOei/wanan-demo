// EndToday —— 最终结束页（极简，不再安利任何内容）
interface Props {
  firstThing: string;
  onFinish: () => void;
}

export function EndToday({ firstThing, onFinish }: Props) {
  return (
    <div className="card fade" style={{ textAlign: 'center' }}>
      <span className="emoji">🌙</span>
      <h2 className="big mb">今天到这里。</h2>
      {firstThing && (
        <p className="muted mb">
          明天第一件事：<b style={{ color: '#cdd3ff' }}>{firstThing}</b>
        </p>
      )}
      <p className="muted mb">其他事情已经安排好了。<br />现在可以放下手机了。</p>
      <button className="btn primary" onClick={onFinish}>结束今天</button>
    </div>
  );
}
