// useBedtime —— 把 状态机 + AI + Tool + localStorage 串成一条主链路
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initialState, reducer, resolveBranch, type Action, type AppState } from '../state/machine';
import { computeWinddown, ensureSeed, loadState, saveState } from '../state/storage';
import { analyze } from '../ai/analyze';
import { executeTool } from '../tools/handler';
import type { AnalysisResult, Mood, SleepSettings } from '../types';

export interface BedtimeApi {
  state: AppState;
  saveSettings: (settings: SleepSettings) => void;
  openSettings: () => void;
  enterBedtime: () => void;
  submitThought: (text: string) => void;
  skipThought: () => void;
  openDocument: () => void;
  completeMiniAction: () => void;
  deviceDone: () => void;
  endToday: () => void;
  screenOff: () => void;
  respectContinue: () => void;
  startNewDay: () => void;
  recordMood: (mood: Mood) => void;
  goHome: () => void;
  addTodo: (text: string) => void;
}

export function useBedtime(): BedtimeApi {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState(ensureSeed(loadState())),
  );

  // 持久化（去抖）
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const t = setTimeout(() => {
      const stored = loadState();
      stored.settings = state.settings;
      stored.history = state.history;
      stored.todos = state.todos;
      if (state.screen === 'END_TODAY') stored.lastEndedAt = new Date().toISOString();
      saveState(stored);
    }, 120);
    return () => clearTimeout(t);
  }, [state]);

  // 分析完成 → 设置 analysis 并确定性地跳到分支视图
  const finishAnalysis = useCallback((analysis: AnalysisResult) => {
    dispatch({ type: 'SET_ANALYSIS', analysis });
    const branch = resolveBranch(analysis);
    // 小延时让 "AI_ANALYSIS 过渡" 短暂可见
    setTimeout(() => dispatch({ type: 'GO_TO', screen: branch }), 700);
  }, []);

  const saveSettings = useCallback((settings: SleepSettings) => {
    dispatch({ type: 'SET_SETTINGS', settings });
    // 标记已配置，写进持久化
    const stored = loadState();
    stored.settings = settings;
    stored.configured = true;
    saveState(stored);
  }, []);

  // 重新打开自定义时间设置
  const openSettings = useCallback(() => dispatch({ type: 'OPEN_SETTINGS' }), []);

  const enterBedtime = useCallback(() => {
    dispatch({ type: 'ENTER_BEDTIME', clock: computeWinddown(state.settings) });
  }, [state.settings]);

  const submitThought = useCallback(
    (text: string) => {
      dispatch({ type: 'START_ANALYSIS' });
      void analyze(text, state.history).then(finishAnalysis);
    },
    [state.history, finishAnalysis],
  );

  const skipThought = useCallback(() => {
    const noPending: AnalysisResult = {
      state: 'no_pending_issue',
      task: '',
      tonight_action: '',
      estimated_minutes: 5,
      tomorrow_action: '',
      action_type: 'NONE',
      target: '',
      reason: '',
      reassurance: '如果其实没什么放不下的，那就好好结束今天吧。',
    };
    dispatch({ type: 'START_ANALYSIS' });
    setTimeout(() => {
      dispatch({ type: 'SET_ANALYSIS', analysis: noPending });
      dispatch({ type: 'GO_TO', screen: 'END_CHOICE' });
    }, 500);
  }, []);

  const openDocument = useCallback(() => {
    const actionType = state.analysis?.action_type ?? 'NONE';
    const target = state.analysis?.target ?? '';
    const res = executeTool(actionType, target);
    dispatch({ type: 'TOOL_EXECUTED', opened: res.opened });
  }, [state.analysis]);

  const completeMiniAction = useCallback(() => {
    dispatch({ type: 'COMPLETE_MINI_ACTION' });
  }, []);

  // 设备（闹钟/勿扰）完成 → 汇入统一结束选择屏
  const deviceDone = useCallback(() => {
    dispatch({ type: 'DEVICE_DONE' });
  }, []);

  const endToday = useCallback(() => dispatch({ type: 'END_TODAY' }), []);
  // 模拟熄屏
  const screenOff = useCallback(() => dispatch({ type: 'SCREEN_OFF' }), []);
  const respectContinue = useCallback(() => dispatch({ type: 'RESPECT_CONTINUE' }), []);
  const startNewDay = useCallback(() => dispatch({ type: 'START_NEW_DAY' }), []);
  const goHome = useCallback(() => dispatch({ type: 'GO_HOME' }), []);

  const recordMood = useCallback(
    (mood: Mood) => {
      // 记录历史：date / endTime / mood
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const endTime = state.demoClock ?? '00:00';
      const entry = { date, endTime, mood };
      // 写进 reducer 状态
      dispatch({
        type: 'GO_TO',
        screen: 'HOME',
      } as Action);
      // 更新 history 到 localStorage（通过副作用：额外 dispatch 一个内部机制）
      // 这里直接修改本地存储 + 触发重载
      synchronizeHistory(entry);
    },
    [state.demoClock],
  );

  // 简单同步：把记录写进 localStorage 并存到 state.history
  function synchronizeHistory(entry: { date: string; endTime: string; mood: Mood }) {
    const stored = loadState();
    stored.history = [...stored.history, entry];
    stored.settings = state.settings;
    stored.todos = state.todos;
    saveState(stored);
    // 强制用新 history 重初始化（触发组件重挂载，简单可靠）
    window.location.reload();
  }

  const addTodo = useCallback((text: string) => {
    dispatch({ type: 'ADD_TODO', text });
  }, []);

  return {
    state,
    saveSettings,
    openSettings,
    enterBedtime,
    submitThought,
    skipThought,
    openDocument,
    completeMiniAction,
    deviceDone,
    endToday,
    screenOff,
    respectContinue,
    startNewDay,
    recordMood,
    goHome,
    addTodo,
  };
}
