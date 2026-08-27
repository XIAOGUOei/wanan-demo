// localStorage 读写 + Demo 种子数据 + 时间计算
import type { HistoryEntry, SleepSettings, StoredStateV1, TodoItem } from '../types';

const KEY = 'wanan.state.v1';

export const DEFAULT_SETTINGS: SleepSettings = {
  sleepTime: '23:00',
  leadMinutes: 30,
  winddownTime: '22:30',
};

// Demo 预置的历史数据 —— 用于展示"历史反馈影响夜晚决策"
const SEED_HISTORY: HistoryEntry[] = [
  { date: '2026-08-24', endTime: '00:49', mood: 'tired' },
  { date: '2026-08-25', endTime: '00:42', mood: 'tired' },
  { date: '2026-08-26', endTime: '00:15', mood: 'ok' },
];

function defaultState(): StoredStateV1 {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    lastEndedAt: null,
    history: [],
    todos: [],
    seeded: false,
    configured: false,
  };
}

export function loadState(): StoredStateV1 {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StoredStateV1>;
    // 基础校正：任何字段缺失/类型异常都用默认值兜底，避免脏数据崩溃
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      lastEndedAt: typeof parsed.lastEndedAt === 'string' ? parsed.lastEndedAt : null,
      seeded: Boolean(parsed.seeded),
      configured: Boolean(parsed.configured),
    };
  } catch {
    // JSON 损坏 → 重置
    return defaultState();
  }
}

export function saveState(state: StoredStateV1): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // localStorage 可能被禁用（隐私模式），静默降级为不持久化
  }
}

/** 首次使用：写入 Demo 种子历史，标记 seeded */
export function ensureSeed(state: StoredStateV1): StoredStateV1 {
  if (state.seeded) return state;
  return { ...state, history: [...SEED_HISTORY], seeded: true };
}

// ---- 时间计算 ----
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function toHHMM(total: number): string {
  const m = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** 收尾/开始结束今天的时间：优先用显式 winddownTime，否则由 sleepTime - leadMinutes 推定（跨午夜处理） */
export function computeWinddown(s: SleepSettings): string {
  if (s.winddownTime) return s.winddownTime;
  return toHHMM(toMinutes(s.sleepTime) - s.leadMinutes);
}

export function addMinutes(hhmm: string, mins: number): string {
  return toHHMM(toMinutes(hhmm) + mins);
}

export function nextTodoId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function makeTodo(text: string): TodoItem {
  return { id: nextTodoId(), text, created: new Date().toISOString() };
}
