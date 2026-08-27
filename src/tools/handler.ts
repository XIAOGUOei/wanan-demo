// Tool 注册表 + Handler（设计文档 §5）
// 安全原则：Tool 集合代码写死、target 白名单、handler 是前端唯一"做事"的地方。
import type { ActionType } from '../types';

export interface ToolTargetDef {
  key: string;
  title: string;
  hint: string;
}

// 允许打开的预置目标白名单 —— LLM 只能从这些 key 里选，绝不接受任意 URL。
export const ALLOWED_TARGETS: string[] = ['presentation', 'email', 'alarm', 'silent'];

export const TOOL_TARGETS: Record<string, ToolTargetDef> = {
  presentation: { key: 'presentation', title: 'Presentation Demo', hint: '模拟打开了你的演示文稿' },
  email: { key: 'email', title: '邮箱 · 草稿', hint: '模拟打开了待回邮件草稿' },
  alarm: { key: 'alarm', title: '闹钟 · 设置', hint: '模拟打开系统闹钟设置' },
  silent: { key: 'silent', title: '勿扰模式', hint: '模拟开启勿扰模式' },
};

export type ToolResult = { ok: boolean; opened: string | null; message: string };

/**
 * 执行一个 Tool。对 target 做白名单校验，拒绝所有不在名单内的输入。
 */
export function executeTool(actionType: ActionType, target: string): ToolResult {
  switch (actionType) {
    case 'OPEN_DOCUMENT': {
      if (!ALLOWED_TARGETS.includes(target)) {
        return { ok: false, opened: null, message: '不允许的目标，已忽略。' };
      }
      const def = TOOL_TARGETS[target];
      return { ok: true, opened: target, message: `已打开 ${def.title}` };
    }
    case 'CREATE_TODO': {
      // 纯 TODO 创建由上层 dispatch ADD_TODO 处理；这里仅确认
      return { ok: true, opened: null, message: '已加入明天的待办清单。' };
    }
    case 'SET_DEVICE': {
      // 设备操作类：闹钟 / 勿扰。DeviceRequest 屏本身就是内嵌面板，
      // 这里仅做白名单确认，不真正控制系统。
      if (!ALLOWED_TARGETS.includes(target)) {
        return { ok: false, opened: null, message: '不允许的设备目标，已忽略。' };
      }
      const def = TOOL_TARGETS[target];
      return { ok: true, opened: target, message: `已打开 ${def.title}` };
    }
    case 'NONE':
    default:
      return { ok: true, opened: null, message: '' };
  }
}

/** 是否需要在 MINI_ACTION 上展示"打开文档"按钮 */
export function needsOpenDocument(actionType: ActionType): boolean {
  return actionType === 'OPEN_DOCUMENT';
}
