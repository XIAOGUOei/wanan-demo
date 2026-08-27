// 共享类型定义 —— 所有模块引用这里，避免循环依赖

export type StateCategory =
  | 'unfinished_task'
  | 'small_pending_action'
  | 'reluctance_to_end'
  | 'device_request'
  | 'no_pending_issue';

export type ActionType = 'OPEN_DOCUMENT' | 'CREATE_TODO' | 'SET_DEVICE' | 'NONE';

export type Mood = 'tired' | 'ok' | 'great';

// LLM 结构化决策结果（被 zod 校验/规范化后的形态）
export interface AnalysisResult {
  state: StateCategory;
  task: string;
  tonight_action: string;
  estimated_minutes: number;
  tomorrow_action: string;
  action_type: ActionType;
  target: string;
  reason: string;
  reassurance: string;
}

// LLM 原始输出（未校验），给 validate.ts 用
export type RawAnalysis = Partial<AnalysisResult>;

export interface HistoryEntry {
  date: string; // "2026-08-27"
  endTime: string; // "00:18"
  mood: Mood;
}

export interface SleepSettings {
  sleepTime: string; // "00:30" 睡觉时间
  leadMinutes: number; // 30（兼容字段：睡眠 - leadMinutes 得出收尾开始时间）
  winddownTime?: string; // "22:30" 收尾/开始结束今天的时间（显式设置；缺省时用 sleepTime - leadMinutes 推定）
}

export interface TodoItem {
  id: string;
  text: string;
  created: string; // ISO
}

export interface StoredStateV1 {
  version: 1;
  settings: SleepSettings;
  lastEndedAt: string | null;
  history: HistoryEntry[];
  todos: TodoItem[];
  seeded: boolean; // 是否已写入 Demo 种子历史
  configured: boolean; // 是否已完成首次设置
}

// 状态机 Screen
export type Screen =
  | 'SETUP'
  | 'HOME'
  | 'BEDTIME_TRIGGER'
  | 'AI_ANALYSIS'
  | 'MINI_ACTION'
  | 'TOOL_CALL'
  | 'DEVICE_REQUEST'
  | 'COMPLETE_ACTION'
  | 'END_CHOICE'
  | 'SHOW_REFLECTION'
  | 'CONTINUE'
  | 'END_TODAY'
  | 'SCREEN_OFF'
  | 'MORNING_FEEDBACK';

export type ToMoodLabel = Record<Mood, string>;
export const MOOD_LABEL: ToMoodLabel = {
  tired: '😴 有点困',
  ok: '🙂 还不错',
  great: '⚡ 精神很好',
};
