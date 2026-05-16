import { getRuntimeHelper, isPlainObject, showToast } from './dom';
import { readTicketFields } from './fields';
import { hashTicketKey } from './hash';
import { resolveMessageScope } from './message-scope';
import { applySafeTheme } from './theme';
import { buildTicketItem } from './ticket-data';

export function initAutoImport(root: HTMLElement): void {
  const helper = getRuntimeHelper();
  if (typeof helper.getVariables !== 'function' || typeof helper.insertOrAssignVariables !== 'function') return;

  const toast = root.querySelector<HTMLElement>('.et-import-toast-v9');
  const front = root.querySelector<HTMLElement>('.et-face.et-front');
  const fields = readTicketFields();
  if (!fields.title) return;

  applySafeTheme(front, fields.color);

  const scope = resolveMessageScope(root, helper);
  if (!scope) {
    showToast(toast, '无法识别当前消息楼层，跳过自动注入', 'error', 2200);
    return;
  }

  const run = async (): Promise<void> => {
    try {
      const vars = helper.getVariables?.(scope) ?? {};
      const statData = isPlainObject(vars.stat_data) ? vars.stat_data : {};
      const eventVars = isPlainObject(statData.事件) ? statData.事件 : {};
      const ticketRuntime = isPlainObject(eventVars.车票注入记录) ? eventVars.车票注入记录 : {};
      const ticketKey = hashTicketKey(fields.title, fields.story);

      if (ticketRuntime[ticketKey] === true) {
        showToast(toast, '该车票已被发放过', 'info', 2200);
        return;
      }

      const heroData = isPlainObject(statData.主角) ? statData.主角 : {};
      const backpack = isPlainObject(heroData.背包) ? heroData.背包 : {};
      const itemName = `车票【${fields.title}】`;

      await helper.insertOrAssignVariables?.(
        {
          stat_data: {
            ...statData,
            事件: { ...eventVars, 车票注入记录: { ...ticketRuntime, [ticketKey]: true } },
            主角: { ...heroData, 背包: { ...backpack, [itemName]: buildTicketItem(fields) } },
          },
        },
        scope,
      );
      showToast(toast, `已自动注入 ${itemName}`, 'success', 2200);
    } catch (error) {
      console.error('Ticket MVU Auto Import Error:', error);
      showToast(toast, `自动注入失败: ${error instanceof Error ? error.message : String(error)}`, 'error', 2200);
    }
  };

  queueMicrotask(run);
}
