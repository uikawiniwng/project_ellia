import { clonePlain, getByPath, getRuntimeHelper, isPlainObject, showToast } from './dom';
import { readTicketFields } from './fields';
import { hashTicketKey } from './hash';
import { resolveMessageId, resolveMessageScope } from './message-scope';
import { buildTicketItem, buildTicketRecord } from './ticket-data';
import type { MessageScope, PlainObject, RuntimeHelper, TicketFields } from './types';
import { readVars, replaceScopeVars, writeVars } from './variables';

const STORE_KEY = 'calendar_float_ticket_alpha_store';
const MESSAGE_KEY = 'calendar_float_ticket_alpha_latest';
const TIME_PATH = 'stat_data.世界.时间';
const LOCATION_PATH = 'stat_data.世界.地点';

type SaveResult = 'already' | 'saved';

function readCurrentContext(helper: RuntimeHelper, scope: MessageScope, fields: TicketFields) {
  const messageVars = readVars(helper, scope);
  const chatVars = readVars(helper, { type: 'chat' });
  return {
    messageVars,
    chatVars,
    time: String(getByPath(messageVars, TIME_PATH) || fields.date).trim(),
    location: String(getByPath(messageVars, LOCATION_PATH) || fields.place).trim(),
  };
}

async function saveBackpackTicket(helper: RuntimeHelper, scope: MessageScope, fields: TicketFields): Promise<SaveResult> {
  const vars = readVars(helper, scope);
  const statData = isPlainObject(vars.stat_data) ? vars.stat_data : {};
  const eventVars = isPlainObject(statData.事件) ? statData.事件 : {};
  const ticketRuntime = isPlainObject(eventVars.车票注入记录) ? eventVars.车票注入记录 : {};
  const heroData = isPlainObject(statData.主角) ? statData.主角 : {};
  const backpack = isPlainObject(heroData.背包) ? heroData.背包 : {};
  const itemName = `车票【${fields.title}】`;
  const ticketKey = hashTicketKey(fields.title, fields.story);
  const alreadyInjected = ticketRuntime[ticketKey] === true && Object.prototype.hasOwnProperty.call(backpack, itemName);
  if (alreadyInjected) return 'already';

  await writeVars(
    helper,
    {
      stat_data: {
        事件: { 车票注入记录: { ...ticketRuntime, [ticketKey]: true } },
        主角: { 背包: { ...backpack, [itemName]: buildTicketItem(fields) } },
      },
    },
    scope,
  );
  return 'saved';
}

async function saveCalendarTicket(helper: RuntimeHelper, scope: MessageScope, fields: TicketFields): Promise<SaveResult> {
  const context = readCurrentContext(helper, scope, fields);
  const record = buildTicketRecord(fields, context.time, context.location);
  const chatVars = clonePlain(context.chatVars);
  const messageVars = clonePlain(context.messageVars);
  const store = isPlainObject(chatVars[STORE_KEY]) ? chatVars[STORE_KEY] : {};
  const tickets = isPlainObject(store.tickets) ? store.tickets : {};
  const latest = isPlainObject(messageVars[MESSAGE_KEY]) ? messageVars[MESSAGE_KEY] : {};
  const alreadySaved = Object.prototype.hasOwnProperty.call(tickets, record.id) && latest.ticketId === record.id;

  chatVars[STORE_KEY] = {
    kind: 'alpha-ticket-store',
    version: 1,
    updatedAt: record.savedAt,
    tickets: { ...tickets, [record.id]: record },
  } satisfies PlainObject;
  await replaceScopeVars(helper, chatVars, { type: 'chat' });

  messageVars[MESSAGE_KEY] = {
    kind: 'alpha-ticket-latest',
    version: 1,
    ticketId: record.id,
    time: record.time,
    location: record.location,
    savedAt: record.savedAt,
  } satisfies PlainObject;
  await replaceScopeVars(helper, messageVars, scope);

  return alreadySaved ? 'already' : 'saved';
}

export function initArchiveTicket(root: HTMLElement): void {
  const helper = getRuntimeHelper();
  const toast = root.querySelector<HTMLElement>('.et-import-toast-v9');
  const stamp = root.querySelector<HTMLElement>('.et-stamp-real-v9');
  const fallbackButton = root.querySelector<HTMLElement>('.et-stamp-mark');
  if (!stamp || !fallbackButton) return;

  const fields = readTicketFields();
  if (!fields.title) return;

  const messageId = resolveMessageId(root, helper);
  const messageScope = resolveMessageScope(root, helper);

  stamp.title = 'Fold/Unfold';
  fallbackButton.title =
    messageId === null ? '无法识别当前楼层，暂不可保存' : `点击 OBSERVED 保存车票记录到第 ${messageId} 楼`;

  fallbackButton.addEventListener('click', async event => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (!messageScope) {
        showToast(toast, '无法识别当前消息楼层，未保存', 'error');
        return;
      }

      const backpackResult = await saveBackpackTicket(helper, messageScope, fields);
      const calendarResult = await saveCalendarTicket(helper, messageScope, fields);
      const alreadySaved = backpackResult === 'already' && calendarResult === 'already';

      fallbackButton.dataset.ticketSaved = 'true';
      fallbackButton.textContent = 'ARCHIVED';
      fallbackButton.title = '该车票已保存';
      showToast(toast, alreadySaved ? '该车票已保存' : '保存成功', alreadySaved ? 'info' : 'success');
    } catch (error) {
      console.error('Ticket Stamp Save Error:', error);
      showToast(toast, `保存失败: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  });
}
