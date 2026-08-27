// analyze.ts —— 调用 LLM 做结构化分析；API 不可用时回落确定性 mock。
// 两种模式产出的 AnalysisResult 结构完全一致，UI 层无感知。
import type { AnalysisResult, HistoryEntry } from '../types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import { normalizeAnalysis } from './schema';

// ---- 配置：可切换 API / mock ----
// 若环境没有可用的 OpenAI 兼容 endpoint/key，请保持 'mock'，保证现场零风险。
const ENV: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env) || {};
const ANALYSIS_MODE: 'api' | 'mock' = (ENV.VITE_ANALYSIS_MODE as 'api' | 'mock' | undefined) ?? 'mock';

const API_URL: string = ENV.VITE_LLM_URL ?? '';
const API_KEY: string = ENV.VITE_LLM_KEY ?? '';
const MODEL: string = ENV.VITE_LLM_MODEL ?? '';

export async function analyze(
  thought: string,
  history: HistoryEntry[],
): Promise<AnalysisResult> {
  if (!thought || !thought.trim()) {
    // 空输入 → 视为无未决事项
    return {
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
  }

  if (ANALYSIS_MODE === 'api' && API_URL) {
    try {
      const res = await fetch(`${API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          model: MODEL || 'gpt-4o-mini',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'bedtime_analysis',
              strict: true,
              schema: schemaForApi(),
            },
          },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt({ thought, history }) },
          ],
        }),
      });
      if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      // 三层防御：normalizeAnalysis 内部做 parse + fallback
      return normalizeAnalysis(content);
    } catch (e) {
      console.warn('[analyze] API 失败，回落 mock：', e);
      return mockAnalyze(thought, history);
    }
  }

  return mockAnalyze(thought, history);
}

/** 供 API 模式使用的 JSON Schema（约等于 zod schema 的 JSON 版） */
function schemaForApi() {
  return {
    type: 'object',
    properties: {
      state: { type: 'string', enum: ['unfinished_task', 'small_pending_action', 'reluctance_to_end', 'device_request', 'no_pending_issue'] },
      task: { type: 'string' },
      tonight_action: { type: 'string' },
      estimated_minutes: { type: 'integer', minimum: 1, maximum: 15 },
      tomorrow_action: { type: 'string' },
      action_type: { type: 'string', enum: ['OPEN_DOCUMENT', 'CREATE_TODO', 'SET_DEVICE', 'NONE'] },
      target: { type: 'string', enum: ['presentation', 'email', 'todo', 'alarm', 'silent'] },
      reason: { type: 'string' },
      reassurance: { type: 'string' },
    },
    required: ['state', 'action_type'],
    additionalProperties: false,
  };
}

// ---- 确定性 mock：关键词规则分类 ----
// 演示场景：无需网络也能完整走 结构化→校验→handler→reducer 管线。
function mockAnalyze(thought: string, history: HistoryEntry[]): AnalysisResult {
  const t = thought;

  const hasPresentation = /presentation|汇报|演示|ppt|讲稿/i.test(t);
  const hasMail = /邮件|email|回信|给.*发/i.test(t);
  const hasStudy = /考试|复习|学习|写作业|论文/i.test(t);
  const hasDevice = /闹钟|提醒|勿扰|定时|alarm|timer|勿扰模式|静音|dnd/i.test(t);
  const hasChatting = /刷|短视频|游戏|聊天|继续|再.*一会|不想睡/i.test(t);
  const hasNothing = /没什么|没事|不知道|没有/i.test(t);

  if (hasPresentation || hasStudy) {
    const topic = hasPresentation ? 'presentation' : '复习';
    return {
      state: 'unfinished_task',
      task: t,
      tonight_action: hasPresentation
        ? '写下 presentation 的开场和三个核心观点'
        : '把明天要考的核心要点列成一张速记卡',
      estimated_minutes: 5,
      tomorrow_action: `继续完成${topic}`,
      action_type: hasPresentation ? 'OPEN_DOCUMENT' : 'CREATE_TODO',
      target: hasPresentation ? 'presentation' : 'todo',
      reason: '有一件明确、但可以今晚了结的小事。',
      reassurance: '今晚不用把整件事做完，只完成最小的一步，就够了。',
    };
  }

  if (hasMail) {
    return {
      state: 'small_pending_action',
      task: t,
      tonight_action: '把要给对方的一句话发出去（3 行以内）',
      estimated_minutes: 2,
      tomorrow_action: '如对方回复，再继续处理',
      action_type: 'OPEN_DOCUMENT',
      target: 'email',
      reason: '只是一个小动作挡在结束之前。',
      reassurance: '把它做个了结，就可以安心结束今天了。',
    };
  }

  if (hasDevice) {
    // 设备操作类请求：定闹钟 / 设提醒 / 开勿扰。既不是未完成任务，也不是"不想睡"，
    // 而是用户睡前的一个具体小操作。给它一个专属分支，温和地"帮个小忙"。
    const silent = /勿扰|静音|dnd/i.test(t);
    const wantsAlarm = /闹钟|提醒|定时|alarm/i.test(t);
    const target = silent ? 'silent' : 'alarm';
    return {
      state: 'device_request',
      task: t,
      tonight_action: `我帮你${silent ? '开启勿扰，直到明早' : '设好闹钟，安心睡'}`,
      estimated_minutes: 1,
      tomorrow_action: silent ? '记得起床后关闭勿扰模式' : '明早按时起床，开始新的一天',
      action_type: 'SET_DEVICE',
      target,
      reason: silent
        ? '用户睡前想开勿扰，避免被打扰。'
        : '用户睡前想定闹钟/提醒，是一个明确的小操作。',
      reassurance: `好，${wantsAlarm ? '这个闹钟' : '勿扰模式'}马上帮你设置好。`,
    };
  }

  if (hasChatting || !hasNothing) {
    const lateDays = history.filter((h) => h.mood === 'tired').length;
    const greatDays = history.filter((h) => h.mood === 'ok' || h.mood === 'great').length;
    const remind =
      lateDays > 0 || greatDays > 0
        ? `你之前有几次在这个时间继续使用手机，第二天记录了"有点困"；而有一次你早点结束，第二天记录的是"还不错"。今晚要不要换一个结局？`
        : `今晚要不要试试早点结束？`;
    return {
      state: 'reluctance_to_end',
      task: '',
      tonight_action: '',
      estimated_minutes: 5,
      tomorrow_action: '',
      action_type: 'NONE',
      target: '',
      reason: '用户没有未完成任务，只是不想结束今天。',
      reassurance: `我懂。你可能不是还有事情没做完，只是还不太想结束今天。${remind}`,
    };
  }

  return {
    state: 'no_pending_issue',
    task: '',
    tonight_action: '',
    estimated_minutes: 5,
    tomorrow_action: '',
    action_type: 'NONE',
    target: '',
    reason: '没有明显未完成事项，也准备结束。',
    reassurance: '如果其实没什么放不下的，那就好好结束今天吧。',
  };
}
