export type PlainObject = Record<string, unknown>;

export type MessageScope = {
  type: 'message';
  message_id: number;
};

export type VariableScope = MessageScope | { type: 'chat' };

export type ToastType = 'info' | 'success' | 'error';

export type TicketFields = {
  title: string;
  color: string;
  date: string;
  place: string;
  macro: string;
  micro: string;
  story: string;
};

export type TicketItem = {
  品质: string;
  类型: string;
  标签: string[];
  效果: {
    逻辑自指: string;
    漫游: string;
    心愿去程: string;
    随车礼品: string;
    旅途见闻: string;
  };
  描述: string;
};

export type RuntimeHelper = Partial<Window['TavernHelper']> & {
  getCurrentMessageId?: () => unknown;
};
