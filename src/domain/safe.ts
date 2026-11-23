// Safe-to-spend until payday. Simple, explainable maths on the numbers the person enters.
// No bank connection, so the answer is only as good as the inputs, and the UI says so.
import { addDays, addMonths, diffDays, type DayKey } from '@/kit/dates';
import type { Pence } from '@/kit/money';

export type Frequency = 'weekly' | 'fortnightly' | 'fourweekly' | 'monthly';

export type PaySetup = { frequency: Frequency; anchor: DayKey }; // anchor = any real payday
export type Bill = { id: string; name: string; amount: Pence; day: number }; // day of month, 1–31
export type Balance = { amount: Pence; asOf: DayKey };

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'fourweekly', label: 'Every 4 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

const stepDays: Record<Exclude<Frequency, 'monthly'>, number> = { weekly: 7, fortnightly: 14, fourweekly: 28 };

/** The next payday strictly after `today`'s start: if today is payday, it counts as payday (returns today). */
export function nextPayday(p: PaySetup, today: DayKey): DayKey {
  if (p.frequency === 'monthly') {
    const dom = Number(p.anchor.slice(8, 10));
    const [ay, am] = p.anchor.split('-').map(Number);
    const [ty, tm] = today.split('-').map(Number);
    let i = (ty - ay) * 12 + (tm - am) - 1; // a month that's safely on or before today
    let k = addMonths(p.anchor, i, dom);
    while (diffDays(k, today) > 0) k = addMonths(p.anchor, ++i, dom);
    return k;
  }
  const step = stepDays[p.frequency];
  const d = diffDays(p.anchor, today);
  const n = Math.ceil(d / step);
  return addDays(p.anchor, n * step);
}

export function previousPayday(p: PaySetup, today: DayKey): DayKey {
  const next = nextPayday(p, today);
  if (p.frequency === 'monthly') return addMonths(next, -1, Number(p.anchor.slice(8, 10)));
  return addDays(next, -stepDays[p.frequency]);
}

/** Bills whose next due date falls from today up to (not including) payday. */
export function billsBeforePayday(bills: Bill[], today: DayKey, payday: DayKey): { bill: Bill; due: DayKey }[] {
  const out: { bill: Bill; due: DayKey }[] = [];
  for (const b of bills) {
    const thisMonth = addMonths(today.slice(0, 8) + '01', 0, b.day);
    const due = diffDays(today, thisMonth) >= 0 ? thisMonth : addMonths(today.slice(0, 8) + '01', 1, b.day);
    if (diffDays(due, payday) > 0) out.push({ bill: b, due });
  }
  return out.sort((a, b) => diffDays(b.due, a.due));
}

export type SafeResult = {
  payday: DayKey;
  daysLeft: number; // including today, until the day before payday
  billsTotal: Pence;
  bills: { bill: Bill; due: DayKey }[];
  safeTotal: Pence; // can be negative
  perDay: Pence;
  isPayday: boolean;
};

export function safeToSpend(balance: Pence, pay: PaySetup, bills: Bill[], today: DayKey, cushion: Pence = 0): SafeResult {
  const payday = nextPayday(pay, today);
  const isPayday = payday === today;
  const effectivePayday = isPayday ? nextPayday(pay, addDays(today, 1)) : payday;
  const daysLeft = Math.max(1, diffDays(today, effectivePayday));
  const due = billsBeforePayday(bills, today, effectivePayday);
  const billsTotal = due.reduce((s, x) => s + x.bill.amount, 0);
  const safeTotal = balance - billsTotal - cushion;
  const perDay = safeTotal > 0 ? Math.floor(safeTotal / daysLeft) : 0;
  return { payday: effectivePayday, daysLeft, billsTotal, bills: due, safeTotal, perDay, isPayday };
}

export type AffordAnswer = { verdict: 'yes' | 'tight' | 'no'; leftAfter: Pence; perDayAfter: Pence };

/** "Can I afford £X?" Yes if it leaves money for the rest of the days; tight if it uses most of it. */
export function canAfford(r: SafeResult, amount: Pence): AffordAnswer {
  const leftAfter = r.safeTotal - amount;
  const perDayAfter = leftAfter > 0 ? Math.floor(leftAfter / r.daysLeft) : 0;
  if (leftAfter < 0) return { verdict: 'no', leftAfter, perDayAfter: 0 };
  if (r.safeTotal > 0 && leftAfter < r.safeTotal * 0.25) return { verdict: 'tight', leftAfter, perDayAfter };
  return { verdict: 'yes', leftAfter, perDayAfter };
}
