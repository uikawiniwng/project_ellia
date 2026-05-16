import type { TicketFields } from './types';

export function readTicketFields(): TicketFields {
  return {
    title: String('$1').trim(),
    color: String('$2').trim(),
    date: String('$3').trim(),
    place: String('$4').trim(),
    macro: String('$5').trim(),
    micro: String('$6').trim(),
    story: String('$7').trim(),
  };
}
