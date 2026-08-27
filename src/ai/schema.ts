// zod schema —— 对应设计文档 §4：LLM Structured Output 的运行时校验层
import { z } from 'zod';
import type { AnalysisResult, RawAnalysis, StateCategory } from '../types';

export const STATE_CATEGORIES = [
  'unfinished_task',
  'small_pending_action',
  'reluctance_to_end',
  'device_request',
  'no_pending_issue',
] as const;

export const ACTION_TYPES = ['OPEN_DOCUMENT', 'CREATE_TODO', 'SET_DEVICE', 'NONE'] as const;

export const AnalysisSchema = z.object({
  state: z.enum(STATE_CATEGORIES),
  task: z.string().optional().default(''),
  tonight_action: z.string().optional().default(''),
  estimated_minutes: z.number().int().min(1).max(15).optional().default(5),
  tomorrow_action: z.string().optional().default(''),
  action_type: z.enum(ACTION_TYPES).optional().default('NONE'),
  target: z.string().optional().default(''),
  reason: z.string().optional().default(''),
  reassurance: z.string().optional().default(''),
});

// 规范化后的 AnalysisResult 类型（与 schema 输出一致）
export type ParsedAnalysis = z.infer<typeof AnalysisSchema>;

/**
 * 兜底：当 LLM 输出完全无法解析时，给出一个"最安全"的分析结果。
 * 原则：未知 → 保守归为 no_pending_issue，不触发任何 Tool，不惊吓用户。
 */
export function safeFallback(input: RawAnalysis | null): AnalysisResult {
  return {
    state: 'no_pending_issue',
    task: input?.task ?? '',
    tonight_action: '',
    estimated_minutes: 5,
    tomorrow_action: input?.tomorrow_action ?? '',
    action_type: 'NONE',
    target: '',
    reason: '暂时没能在你这句话里找到一个明确的未完成事项。',
    reassurance: '如果其实没什么放不下的，那就好好结束今天吧。',
  };
}

/**
 * 从一段可能包含 JSON 的文本中尽力提取对象。
 * 处理模型多输出了前缀/后缀/解释文字的情况。
 */
export function extractJsonObject(text: string): unknown | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* 继续尝试括号匹配 */
    }
  }
  // 尝试从文本中找到首个 { 到最末 } 的片段
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * 把任意来源（structured 对象 / JSON 文本 / mock）规范化为 AnalysisResult。
 * 三层防御：结构化 → JSON.parse → safeFallback。
 */
export function normalizeAnalysis(raw: unknown): AnalysisResult {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const parsed = AnalysisSchema.safeParse(raw);
    if (parsed.success) return parsed.data as AnalysisResult;
  }
  if (typeof raw === 'string') {
    const obj = extractJsonObject(raw);
    if (obj !== null) {
      const parsed = AnalysisSchema.safeParse(obj);
      if (parsed.success) return parsed.data as AnalysisResult;
    }
  }
  // 兜底：保守归 no_pending_issue
  return safeFallback(null);
}

export type { StateCategory };
