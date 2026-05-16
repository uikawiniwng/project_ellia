import { clonePlain, mergePlain } from './dom';
import type { PlainObject, RuntimeHelper, VariableScope } from './types';

export function readVars(helper: RuntimeHelper, scope: VariableScope | null): PlainObject {
  if (!scope || typeof helper.getVariables !== 'function') return {};

  try {
    return clonePlain(helper.getVariables(scope as VariableOption));
  } catch (_) {
    return {};
  }
}

export async function writeVars(
  helper: RuntimeHelper,
  patch: PlainObject,
  scope: VariableScope | null,
): Promise<void> {
  if (!scope) throw new Error('无法识别当前消息楼层');

  if (typeof helper.insertOrAssignVariables === 'function') {
    await helper.insertOrAssignVariables(patch, scope as VariableOption);
    return;
  }

  if (typeof helper.replaceVariables === 'function') {
    const current = readVars(helper, scope);
    await helper.replaceVariables(mergePlain(current, patch), scope as VariableOption);
    return;
  }

  throw new Error('变量写入接口不可用');
}

export async function replaceScopeVars(
  helper: RuntimeHelper,
  variables: PlainObject,
  scope: VariableScope | null,
): Promise<void> {
  if (!scope) throw new Error('无法识别当前消息楼层');

  if (typeof helper.replaceVariables === 'function') {
    await helper.replaceVariables(variables, scope as VariableOption);
    return;
  }

  if (typeof helper.insertOrAssignVariables === 'function') {
    await helper.insertOrAssignVariables(variables, scope as VariableOption);
    return;
  }

  throw new Error('变量写入接口不可用');
}
