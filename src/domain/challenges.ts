// Savings challenges. Pure functions over plain data, so they're easy to test and migrate.
import { addDays, diffDays, weekday, type DayKey } from '@/kit/dates';
import type { Pence } from '@/kit/money';

export type ChallengeKind = 'week52' | 'daily' | 'envelopes' | 'target' | 'nospend';

export type Deposit = { id: string; day: DayKey; amount: Pence; slot?: number };

export type Challenge = {
  id: string;
  kind: ChallengeKind;
  name: string;
  start: DayKey;
  /** week52: reverse order. daily: amount per day + days. target: goal + days. nospend: weekends. */
  params: { reverse?: boolean; perDay?: Pence; days?: number; goal?: Pence; weekends?: number; unit?: Pence };
  deposits: Deposit[];
  completedOn?: DayKey;
};

export type Template = {
  kind: ChallengeKind;
  name: string;
  blurb: string;
  emoji: string;
  defaults: Challenge['params'];
};

export const TEMPLATES: Template[] = [
  { kind: 'week52', name: '52-week challenge', emoji: '📅', blurb: 'Save £1 in week 1, £2 in week 2… up to £52. £1,378 by the end of the year.', defaults: { unit: 100 } },
  { kind: 'target', name: '£1,000 in 90 days', emoji: '🎯', blurb: 'Stack any amount, any day. We show the pace that gets you there.', defaults: { goal: 100_000, days: 90 } },
  { kind: 'envelopes', name: '100 envelopes', emoji: '✉️', blurb: 'Open a random envelope from 1 to 100 and save that many pounds. £5,050 in total.', defaults: { unit: 100 } },
  { kind: 'daily', name: '£5 a day', emoji: '🪙', blurb: 'Five pounds a day for 100 days. £500, one tap at a time.', defaults: { perDay: 500, days: 100 } },
  { kind: 'nospend', name: 'No-spend weekends', emoji: '🛋️', blurb: 'Keep 8 weekends spend-free and stack what you would have spent.', defaults: { weekends: 8 } },
];

export type Slot = { slot: number; amount: Pence; due: DayKey; done: boolean };

const unit = (c: Challenge) => c.params.unit ?? 100;

/** The fixed slots a challenge is made of (weeks, envelopes, days, weekends). Target challenges have none. */
export function slots(c: Challenge): Slot[] {
  const done = new Set(c.deposits.filter((d) => d.slot != null).map((d) => d.slot!));
  switch (c.kind) {
    case 'week52':
      return Array.from({ length: 52 }, (_, i) => {
        const n = c.params.reverse ? 52 - i : i + 1;
        return { slot: i + 1, amount: n * unit(c), due: addDays(c.start, i * 7), done: done.has(i + 1) };
      });
    case 'envelopes':
      return Array.from({ length: 100 }, (_, i) => ({ slot: i + 1, amount: (i + 1) * unit(c), due: c.start, done: done.has(i + 1) }));
    case 'daily': {
      const days = c.params.days ?? 100;
      return Array.from({ length: days }, (_, i) => ({ slot: i + 1, amount: c.params.perDay ?? 500, due: addDays(c.start, i), done: done.has(i + 1) }));
    }
    case 'nospend': {
      const n = c.params.weekends ?? 8;
      // First Saturday on or after the start.
      const firstSat = addDays(c.start, (6 - weekday(c.start) + 7) % 7);
      return Array.from({ length: n }, (_, i) => ({ slot: i + 1, amount: 0, due: addDays(firstSat, i * 7), done: done.has(i + 1) }));
    }
    case 'target':
      return [];
  }
}

export function goal(c: Challenge): Pence {
  if (c.kind === 'target') return c.params.goal ?? 100_000;
  if (c.kind === 'nospend') return 0;
  return slots(c).reduce((s, x) => s + x.amount, 0);
}

export function saved(c: Challenge): Pence {
  return c.deposits.reduce((s, d) => s + d.amount, 0);
}

export function progress(c: Challenge): number {
  if (c.kind === 'nospend') {
    const all = slots(c);
    return all.length ? all.filter((s) => s.done).length / all.length : 0;
  }
  const g = goal(c);
  return g > 0 ? Math.min(1, saved(c) / g) : 0;
}

export function isComplete(c: Challenge): boolean {
  if (c.kind === 'nospend' || c.kind === 'week52' || c.kind === 'envelopes' || c.kind === 'daily') return slots(c).every((s) => s.done);
  return saved(c) >= goal(c);
}

export function endDay(c: Challenge): DayKey {
  switch (c.kind) {
    case 'week52':
      return addDays(c.start, 51 * 7 + 6);
    case 'daily':
      return addDays(c.start, (c.params.days ?? 100) - 1);
    case 'target':
      return addDays(c.start, (c.params.days ?? 90) - 1);
    case 'nospend': {
      const s = slots(c);
      return addDays(s[s.length - 1].due, 1);
    }
    case 'envelopes':
      return addDays(c.start, 364);
  }
}

/** What "on track" would look like today, for kinds with a schedule. */
export function expectedByToday(c: Challenge, today: DayKey): Pence | null {
  if (c.kind === 'target') {
    const days = c.params.days ?? 90;
    const elapsed = Math.min(days, Math.max(0, diffDays(c.start, today) + 1));
    return Math.round((goal(c) * elapsed) / days);
  }
  if (c.kind === 'week52' || c.kind === 'daily') {
    return slots(c)
      .filter((s) => diffDays(s.due, today) >= 0)
      .reduce((sum, s) => sum + s.amount, 0);
  }
  return null;
}

export type Pace = { state: 'ahead' | 'on-track' | 'catch-up' | 'none'; diff: Pence };

/** Kind pace message data. "catch-up" never means failure: it's the gap to close, if you want to. */
export function pace(c: Challenge, today: DayKey): Pace {
  const exp = expectedByToday(c, today);
  if (exp == null) return { state: 'none', diff: 0 };
  const d = saved(c) - exp;
  if (d > 0) return { state: 'ahead', diff: d };
  if (d === 0) return { state: 'on-track', diff: 0 };
  return { state: 'catch-up', diff: -d };
}

/** The obvious next tap for the Today screen. */
export function nextSlot(c: Challenge, today: DayKey): Slot | null {
  const open = slots(c).filter((s) => !s.done);
  if (!open.length) return null;
  if (c.kind === 'envelopes') return null; // envelopes are picked at random
  const due = open.filter((s) => diffDays(s.due, today) >= 0);
  return due[0] ?? open[0];
}

/** A random unopened envelope. `rand` is injectable for tests. */
export function pickEnvelope(c: Challenge, rand: () => number = Math.random): Slot | null {
  const open = slots(c).filter((s) => !s.done);
  if (!open.length) return null;
  return open[Math.floor(rand() * open.length) % open.length];
}

/** Validates a deposit before it's stored. Returns an error message, or null if it's fine. */
export function depositError(c: Challenge, amount: Pence, slot?: number): string | null {
  if (!Number.isInteger(amount) || amount < 0) return 'Enter an amount in pounds and pence.';
  if (amount === 0 && c.kind !== 'nospend') return 'Enter an amount above £0.';
  if (amount > 10_000_000) return "That's more than this challenge can hold.";
  if (slot != null) {
    const s = slots(c).find((x) => x.slot === slot);
    if (!s) return "That slot isn't part of this challenge.";
    if (s.done) return "You've already ticked that one off.";
  }
  return null;
}

export function slotLabel(c: Challenge, slot: number): string {
  switch (c.kind) {
    case 'week52':
      return `Week ${slot}`;
    case 'envelopes':
      return `Envelope ${slot}`;
    case 'daily':
      return `Day ${slot}`;
    case 'nospend':
      return `Weekend ${slot}`;
    default:
      return `Deposit`;
  }
}
