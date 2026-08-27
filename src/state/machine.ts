// React 状态机：Screen + reducer + 转移表
// 核心原则：任何界面变化都是确定性的状态转移；LLM 输出只进入 analysis 字段。
import type { AnalysisResult, Mood, Screen, SleepSettings, StoredStateV1, HistoryEntry, TodoItem } from '../types';

export interface AppState {
  screen: Screen;
  settings: SleepSettings;
  demoClock: string; // 演示用模拟时钟
  analysis: AnalysisResult | null;
  toolOpened: string | null;
  miniActionCompleted: boolean;
  history: HistoryEntry[];
  todos: TodoItem[];
}

export type Action =
  | { type: 'SET_SETTINGS'; settings: SleepSettings }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'GO_HOME' }
  | { type: 'ENTER_BEDTIME'; clock: string }
  | { type: 'START_ANALYSIS' } // 进入 AI_ANALYSIS 过渡视图
  | { type: 'GO_TO'; screen: Screen } // 分析完成后确定性跳到分支视图
  | { type: 'SET_ANALYSIS'; analysis: AnalysisResult }
  | { type: 'TOOL_EXECUTED'; opened: string | null }
  | { type: 'COMPLETE_MINI_ACTION' }
  | { type: 'DEVICE_DONE' }
  | { type: 'END_TODAY' }
  | { type: 'SCREEN_OFF' }
  | { type: 'RESPECT_CONTINUE' }
  | { type: 'START_NEW_DAY' }
  | { type: 'RECORD_MOOD'; mood: Mood }
  | { type: 'ADD_TODO'; text: string };

export const initialState = (state: StoredStateV1): AppState => ({
  screen: state.configured ? 'HOME' : 'SETUP',
  settings: state.settings,
  demoClock: '00:00',
  analysis: null,
  toolOpened: null,
  miniActionCompleted: false,
  history: state.history,
  todos: state.todos,
});

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings, screen: 'HOME' };

    case 'OPEN_SETTINGS':
      // 重新打开自定义时间设置（保留已有设置），保存后回到 HOME
      return { ...state, screen: 'SETUP' };

    case 'GO_HOME':
      return { ...state, screen: 'HOME', analysis: null, toolOpened: null, miniActionCompleted: false };

    case 'ENTER_BEDTIME':
      return { ...state, screen: 'BEDTIME_TRIGGER', demoClock: action.clock };

    case 'START_ANALYSIS':
      return { ...state, screen: 'AI_ANALYSIS', analysis: null };

    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis };

    case 'GO_TO':
      return { ...state, screen: action.screen };

    case 'TOOL_EXECUTED':
      if (action.opened) {
        // 打开文档 → 内嵌模拟文档面板
        return { ...state, screen: 'TOOL_CALL', toolOpened: action.opened, miniActionCompleted: true };
      }
      // 无跳转的小动作 → 完成确认
      return { ...state, screen: 'COMPLETE_ACTION', miniActionCompleted: true };

    case 'COMPLETE_MINI_ACTION':
      return { ...state, screen: 'COMPLETE_ACTION', miniActionCompleted: true };

    case 'DEVICE_DONE':
      // 设备操作（闹钟/勿扰）完成 → 汇入统一的"结束选择"屏
      return { ...state, screen: 'END_CHOICE', miniActionCompleted: true };

    case 'END_TODAY':
      return { ...state, screen: 'END_TODAY' };

    case 'SCREEN_OFF':
      // 用户选择"今天就到这里/直接放下手机" → 模拟熄屏
      return { ...state, screen: 'SCREEN_OFF' };

    case 'RESPECT_CONTINUE':
      return { ...state, screen: 'CONTINUE' };

    case 'START_NEW_DAY':
      return { ...state, screen: 'MORNING_FEEDBACK', demoClock: '09:00' };

    case 'RECORD_MOOD':
      return { ...state, screen: 'HOME' };

    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Math.random().toString(36).slice(2), text: action.text, created: new Date().toISOString() }],
      };

    default:
      return state;
  }
}

/**
 * 根据 analysis.state 决定分析完成后的目标分支视图（确定性）。
 */
export function resolveBranch(analysis: AnalysisResult): Screen {
  switch (analysis.state) {
    case 'unfinished_task':
    case 'small_pending_action':
      return 'MINI_ACTION';
    case 'reluctance_to_end':
      return 'SHOW_REFLECTION';
    case 'device_request':
      return 'DEVICE_REQUEST';
    case 'no_pending_issue':
    default:
      return 'END_CHOICE';
  }
}
