// CompleteAction —— 完成最后一个小任务后的确认
// 保留个性化的头部（"好了" / "明天第一件事" / "现在，不用再处理它了"），
// 然后把"二选一 + 再等等历史确认"交给统一的 EndChoice 组件。
import type { AnalysisResult, HistoryEntry } from '../../types';
import { EndChoice } from './EndChoice';

interface Props {
  analysis: AnalysisResult;
  history: HistoryEntry[];
  onEnd: () => void; // 今天就到这里 → 直接熄屏
  onContinue: () => void; // 再等等后"我再看看" → 继续
}

export function CompleteAction({ analysis, history, onEnd, onContinue }: Props) {
  const intro = analysis.tomorrow_action
    ? `明天第一件事：${analysis.tomorrow_action}。我已经帮你记下了。现在，不用再处理它了。`
    : analysis.reassurance
      ? `现在，不用再处理它了。${analysis.reassurance}`
      : '现在，不用再处理它了。';

  return (
    <EndChoice
      context="都处理完了。"
      intro={intro}
      history={history}
      onEnd={onEnd}
      onContinue={onContinue}
    />
  );
}
