// 历史反馈 → 个性化提醒（确定性纯函数，不接入 LLM，不做健康预测）
import type { HistoryEntry } from '../types';

export interface ReflectionSummary {
  lateTiredCount: number; // 继续使用手机且次日"有点困"的天数
  earlyGoodCount: number; // 早点结束且次日状态不错的次数
  lastMood: string | null;
}

/** 从历史记录计算用于提醒的指标（仅引用用户自己的记录） */
export function summarizeHistory(history: HistoryEntry[]): ReflectionSummary {
  let lateTired = 0;
  let earlyGood = 0;
  for (const h of history) {
    // "晚睡且次日有点困"
    if (h.mood === 'tired') lateTired += 1;
    // "早点结束且状态不错"
    if ((h.mood === 'ok' || h.mood === 'great')) earlyGood += 1;
  }
  const last = history.length > 0 ? history[history.length - 1] : null;
  return {
    lateTiredCount: lateTired,
    earlyGoodCount: earlyGood,
    lastMood: last ? last.mood : null,
  };
}

/** 生成温和的个性化提醒文案（不预测、不说教、只引用用户记录） */
export function buildReflectionMessage(history: HistoryEntry[]): string {
  if (history.length === 0) {
    return '今晚要不要试试早点结束，看看明天是什么感觉？';
  }
  const s = summarizeHistory(history);
  const parts: string[] = [];
  if (s.lateTiredCount > 0) {
    parts.push(`你之前有几次在这个时间继续使用手机，第二天记录了"有点困"`);
  }
  if (s.earlyGoodCount > 0) {
    parts.push(`而有的时候你早点结束，第二天记录的状态不错`);
  }
  if (parts.length === 0) {
    return '今晚要不要试试早点结束，看看明天是什么感觉？';
  }
  return parts.join('；') + '。今晚，要不要试着换一个结局？';
}
