// AI_ANALYSIS —— 分析过渡视图
export function AIAnalysis() {
  return (
    <div className="card fade" style={{ textAlign: 'center' }}>
      <span className="emoji">🌙</span>
      <div className="loading">
        <span className="spinner" />
        <span>让我听一听你在想什么……</span>
      </div>
      <p className="muted small">不用着急，慢慢来。</p>
    </div>
  );
}
