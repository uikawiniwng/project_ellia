import { hashText } from './hash';
import type { TicketFields, TicketItem } from './types';

export function buildTicketItem(fields: Pick<TicketFields, 'story'>): TicketItem {
  return {
    品质: '唯一',
    类型: '消耗品',
    标签: ['去往何方'],
    效果: {
      逻辑自指: '无法通过该物品或该物品造成的结果获得新的车票(如传送到达新的地点),以下效果一张车票仅能触发一个',
      漫游: '消耗FP将持有者传送到随机位置',
      心愿去程: '消耗FP实现一个渺小的愿望，消耗的FP由愿望难度决定',
      随车礼品: '兑换为一定量FP',
      旅途见闻: `将以下内容兑换为任务:${fields.story}`,
    },
    描述: '于是 紫发少女说:“旅行的结晶，愿望结晶...总之是这样的东西。”',
  };
}

export function buildRawTicket(fields: TicketFields): string {
  return (
    '[Ticket:Tu, was du willst] Title:: ' +
    fields.title +
    ' Color:: ' +
    fields.color +
    ' Date:: ' +
    fields.date +
    ' Place:: ' +
    fields.place +
    ' Macro:: ' +
    fields.macro +
    ' Micro:: ' +
    fields.micro +
    ' Story:: ' +
    fields.story +
    ' [/Ticket]'
  );
}

export function buildTicketRecord(fields: TicketFields, time: string, location: string) {
  const savedAt = new Date().toISOString();
  return {
    id: `ticket_${hashText([fields.title, fields.date, fields.place, fields.story].join('|'))}`,
    kind: 'alpha-ticket-record',
    version: 1,
    savedAt,
    time: time || fields.date,
    location: location || fields.place,
    raw: buildRawTicket(fields),
    fields,
  };
}
