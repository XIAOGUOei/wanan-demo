// Continue —— 尊重用户继续的选择
interface Props {
  onGoHome: () => void;
}

export function Continue({ onGoHome }: Props) {
  return (
    <div className="card fade">
      <span className="emoji">🌙</span>
      <h2 className="big mb">好，选择权在你。</h2>
      <p className="muted mb">
        等你准备结束时，再回来。
        <br />
        我一直在这里。
      </p>
      <button className="btn secondary" onClick={onGoHome}>好的</button>
    </div>
  );
}
