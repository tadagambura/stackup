import { canAfford, billsBeforePayday, nextPayday, previousPayday, safeToSpend, type PaySetup } from '../safe';
import { depositError, expectedByToday, goal, isComplete, nextSlot, pace, pickEnvelope, progress, slots, type Challenge } from '../challenges';
import { levelFor, lessonForDay, type LessonPack } from '../lessons';

const ch = (kind: Challenge['kind'], params: Challenge['params'] = {}, start = '2026-11-23'): Challenge => ({ id: 'c', kind, name: kind, start, params: { unit: 100, ...params }, deposits: [] });

describe('challenges', () => {
  test('52-week totals £1,378 and schedules weekly', () => {
    const c = ch('week52');
    expect(goal(c)).toBe(137_800);
    const s = slots(c);
    expect(s[0]).toMatchObject({ slot: 1, amount: 100, due: '2026-11-23' });
    expect(s[51]).toMatchObject({ slot: 52, amount: 5200, due: '2027-11-15' });
    expect(slots(ch('week52', { reverse: true }))[0].amount).toBe(5200);
  });

  test('100 envelopes total £5,050 and random picks only unopened ones', () => {
    const c = ch('envelopes');
    expect(goal(c)).toBe(505_000);
    c.deposits = Array.from({ length: 99 }, (_, i) => ({ id: String(i), day: '2026-11-23', amount: (i + 1) * 100, slot: i + 1 }));
    expect(pickEnvelope(c, () => 0.99)?.slot).toBe(100);
    c.deposits.push({ id: 'x', day: '2026-11-23', amount: 10_000, slot: 100 });
    expect(pickEnvelope(c)).toBeNull();
    expect(isComplete(c)).toBe(true);
  });

  test('target pace is kind: ahead, on track or catch-up', () => {
    const c = ch('target', { goal: 90_000, days: 90 });
    expect(expectedByToday(c, '2026-11-23')).toBe(1000); // day 1 of 90
    expect(pace(c, '2026-11-23')).toEqual({ state: 'catch-up', diff: 1000 });
    c.deposits.push({ id: 'd', day: '2026-11-23', amount: 2500 });
    expect(pace(c, '2026-11-24')).toEqual({ state: 'ahead', diff: 500 });
    expect(progress(c)).toBeCloseTo(2500 / 90_000);
  });

  test('next slot is the earliest due one that is still open', () => {
    const c = ch('daily', { perDay: 500, days: 10 });
    c.deposits.push({ id: 'a', day: '2026-11-23', amount: 500, slot: 1 });
    expect(nextSlot(c, '2026-11-25')?.slot).toBe(2);
  });

  test('no-spend weekends start on the first Saturday', () => {
    const c = ch('nospend', { weekends: 4 }); // 23 Nov 2026 is a Monday
    expect(slots(c).map((s) => s.due)).toEqual(['2026-11-28', '2026-12-05', '2026-12-12', '2026-12-19']);
    expect(depositError(c, 0, 1)).toBeNull();
  });

  test('deposit validation', () => {
    const c = ch('week52');
    c.deposits.push({ id: 'a', day: '2026-11-23', amount: 100, slot: 1 });
    expect(depositError(c, 0)).toMatch(/above £0/);
    expect(depositError(c, 200, 1)).toMatch(/already/);
    expect(depositError(c, 200, 99)).toMatch(/isn't part/);
    expect(depositError(c, 200, 2)).toBeNull();
    expect(depositError(c, 1.5)).toMatch(/pounds and pence/);
  });
});

describe('safe to spend', () => {
  const monthly: PaySetup = { frequency: 'monthly', anchor: '2026-10-31' };

  test('monthly payday clamps to short months', () => {
    expect(nextPayday(monthly, '2026-11-23')).toBe('2026-11-30');
    expect(nextPayday(monthly, '2026-12-01')).toBe('2026-12-31');
    expect(nextPayday(monthly, '2027-02-02')).toBe('2027-02-28');
    expect(nextPayday({ frequency: 'monthly', anchor: '2027-03-15' }, '2026-11-23')).toBe('2026-12-15');
    expect(previousPayday(monthly, '2026-11-23')).toBe('2026-10-31');
  });

  test('weekly and fortnightly paydays', () => {
    expect(nextPayday({ frequency: 'weekly', anchor: '2026-11-20' }, '2026-11-23')).toBe('2026-11-27');
    expect(nextPayday({ frequency: 'fortnightly', anchor: '2026-11-20' }, '2026-11-23')).toBe('2026-12-04');
    expect(nextPayday({ frequency: 'fortnightly', anchor: '2026-12-18' }, '2026-11-23')).toBe('2026-12-04');
    expect(nextPayday({ frequency: 'fourweekly', anchor: '2026-11-23' }, '2026-11-23')).toBe('2026-11-23');
  });

  test('bills due before payday are subtracted', () => {
    const bills = [
      { id: 'a', name: 'Phone', amount: 1500, day: 25 },
      { id: 'b', name: 'Rent', amount: 60_000, day: 1 },
    ];
    expect(billsBeforePayday(bills, '2026-11-23', '2026-11-30').map((x) => x.bill.name)).toEqual(['Phone']);
    const r = safeToSpend(31_500, monthly, bills, '2026-11-23');
    expect(r.payday).toBe('2026-11-30');
    expect(r.daysLeft).toBe(7);
    expect(r.billsTotal).toBe(1500);
    expect(r.safeTotal).toBe(30_000);
    expect(r.perDay).toBe(4285);
  });

  test('on payday, the countdown moves to the next one', () => {
    const r = safeToSpend(100_000, { frequency: 'weekly', anchor: '2026-11-27' }, [], '2026-11-27');
    expect(r.isPayday).toBe(true);
    expect(r.payday).toBe('2026-12-04');
    expect(r.daysLeft).toBe(7);
  });

  test('can I afford it', () => {
    const r = safeToSpend(20_000, monthly, [], '2026-11-23');
    expect(canAfford(r, 5000).verdict).toBe('yes');
    expect(canAfford(r, 17_000).verdict).toBe('tight');
    expect(canAfford(r, 25_000)).toEqual({ verdict: 'no', leftAfter: -5000, perDayAfter: 0 });
  });
});

describe('lessons', () => {
  const pack: LessonPack = {
    pack: 't', version: 1, checked: '2026-11-23', reviewed: false,
    lessons: [1, 2, 3].map((n) => ({ id: `l${n}`, topic: 't', title: `L${n}`, body: '', quiz: { q: '', options: ['a', 'b', 'c'], answer: 0, explain: '' }, source: { name: 's', url: 'https://x' } })),
  };
  test('walks the pack in order and loops', () => {
    expect(lessonForDay(pack, '2026-11-23', '2026-11-23').id).toBe('l1');
    expect(lessonForDay(pack, '2026-11-23', '2026-11-25').id).toBe('l3');
    expect(lessonForDay(pack, '2026-11-23', '2026-11-26').id).toBe('l1');
  });
  test('levels', () => {
    expect(levelFor(0)).toEqual({ level: 1, into: 0, span: 50 });
    expect(levelFor(50)).toEqual({ level: 2, into: 0, span: 70 });
    expect(levelFor(119).level).toBe(2);
    expect(levelFor(120).level).toBe(3);
  });
});
