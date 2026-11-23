import { todayKey, type DayKey } from '@/kit/dates';
import type { Pence } from '@/kit/money';
import { persisted, uid } from '@/kit/store';
import type { Challenge, ChallengeKind, Deposit } from '@/domain/challenges';
import type { Bill, PaySetup } from '@/domain/safe';
import { XP_CORRECT, XP_TRIED } from '@/domain/lessons';

// ---------- Challenges ----------

type ChallengesState = {
  challenges: Challenge[];
  start: (kind: ChallengeKind, name: string, params: Challenge['params'], start?: DayKey) => string;
  deposit: (id: string, amount: Pence, slot?: number) => Deposit;
  undo: (id: string, depositId: string) => void;
  markComplete: (id: string, day: DayKey) => void;
  remove: (id: string) => Challenge | undefined;
  restore: (c: Challenge) => void;
};

export const useChallenges = persisted<ChallengesState>('stackup.challenges', 1, (set, get) => ({
  challenges: [],
  start: (kind, name, params, start = todayKey()) => {
    const id = uid('c');
    set((s) => ({ challenges: [...s.challenges, { id, kind, name, start, params, deposits: [] }] }));
    return id;
  },
  deposit: (id, amount, slot) => {
    const d: Deposit = { id: uid('d'), day: todayKey(), amount, slot };
    set((s) => ({ challenges: s.challenges.map((c) => (c.id === id ? { ...c, deposits: [...c.deposits, d] } : c)) }));
    return d;
  },
  undo: (id, depositId) =>
    set((s) => ({
      challenges: s.challenges.map((c) => (c.id === id ? { ...c, completedOn: undefined, deposits: c.deposits.filter((d) => d.id !== depositId) } : c)),
    })),
  markComplete: (id, day) => set((s) => ({ challenges: s.challenges.map((c) => (c.id === id ? { ...c, completedOn: day } : c)) })),
  remove: (id) => {
    const c = get().challenges.find((x) => x.id === id);
    set((s) => ({ challenges: s.challenges.filter((x) => x.id !== id) }));
    return c;
  },
  restore: (c) => set((s) => ({ challenges: [...s.challenges, c] })),
}));

// ---------- Money (safe-to-spend) ----------

export type Spend = { id: string; day: DayKey; amount: Pence };

type MoneyState = {
  pay: PaySetup | null;
  balance: Pence | null;
  balanceDay: DayKey | null;
  bills: Bill[];
  spends: Spend[];
  setPay: (p: PaySetup) => void;
  setBalance: (amount: Pence) => void;
  addBill: (b: Omit<Bill, 'id'>) => void;
  removeBill: (id: string) => void;
  logSpend: (amount: Pence) => Spend;
  undoSpend: (id: string) => void;
};

export const useMoney = persisted<MoneyState>('stackup.money', 1, (set) => ({
  pay: null,
  balance: null,
  balanceDay: null,
  bills: [],
  spends: [],
  setPay: (pay) => set({ pay }),
  // Setting the balance starts a fresh count: earlier spends are already in the new number.
  setBalance: (amount) => set({ balance: amount, balanceDay: todayKey(), spends: [] }),
  addBill: (b) => set((s) => ({ bills: [...s.bills, { ...b, id: uid('b') }] })),
  removeBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),
  logSpend: (amount) => {
    const sp = { id: uid('s'), day: todayKey(), amount };
    set((s) => ({ spends: [...s.spends, sp] }));
    return sp;
  },
  undoSpend: (id) => set((s) => ({ spends: s.spends.filter((x) => x.id !== id) })),
}));

/** Balance now = last balance entered minus spends logged since. */
export function currentBalance(m: Pick<MoneyState, 'balance' | 'spends'>): Pence | null {
  if (m.balance == null) return null;
  return m.balance - m.spends.reduce((s, x) => s + x.amount, 0);
}

// ---------- Learning ----------

export type Answer = { lessonId: string; correct: boolean };

type LearnState = {
  firstDay: DayKey | null;
  xp: number;
  answers: Record<DayKey, Answer>;
  answer: (day: DayKey, lessonId: string, correct: boolean) => number;
  ensureStarted: () => DayKey;
};

export const useLearn = persisted<LearnState>('stackup.learn', 1, (set, get) => ({
  firstDay: null,
  xp: 0,
  answers: {},
  ensureStarted: () => {
    const f = get().firstDay;
    if (f) return f;
    const t = todayKey();
    set({ firstDay: t });
    return t;
  },
  answer: (day, lessonId, correct) => {
    if (get().answers[day]) return 0; // one lesson's XP per day
    const gained = correct ? XP_CORRECT : XP_TRIED;
    set((s) => ({ xp: s.xp + gained, answers: { ...s.answers, [day]: { lessonId, correct } } }));
    return gained;
  },
}));
