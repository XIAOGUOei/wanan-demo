// MorningFeedback —— 第二天开始时反馈状态
import type { Mood } from '../../types';
import { MOOD_LABEL } from '../../types';

interface Props {
  endTime: string;
  onMood: (mood: Mood) => void;
}

export function MorningFeedback({ endTime, onMood }: Props) {
  return (
    <div className="card fade">
      <span className="emoji">☀️</span>
      <h2 className="big mb">开始今天</h2>
      <p className="muted mb">昨晚你在 <b style={{ color: '#cdd3ff' }}>{endTime}</b> 结束了今天。</p>
      <p className="muted mb">现在感觉怎么样？</p>

      <button className="btn" onClick={() => onMood('tired')}>{MOOD_LABEL.tired}</button>
      <button className="btn" onClick={() => onMood('ok')}>{MOOD_LABEL.ok}</button>
      <button className="btn" onClick={() => onMood('great')}>{MOOD_LABEL.great}</button>
    </div>
  );
}
