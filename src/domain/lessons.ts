// The daily money lesson: which lesson is today's, XP and levels.
import { diffDays, type DayKey } from '@/kit/dates';

export type Lesson = {
  id: string;
  topic: string;
  title: string;
  body: string;
  quiz: { q: string; options: string[]; answer: number; explain: string };
  source: { name: string; url: string };
};

export type LessonPack = { pack: string; version: number; checked: string; reviewed: boolean; lessons: Lesson[] };

/** Today's lesson walks through the pack in order from the day the person started, then loops. */
export function lessonForDay(pack: LessonPack, firstDay: DayKey, today: DayKey): Lesson {
  const n = pack.lessons.length;
  const i = ((diffDays(firstDay, today) % n) + n) % n;
  return pack.lessons[i];
}

export const XP_CORRECT = 10;
export const XP_TRIED = 5;

/** Levels get a little further apart each time: 50, 120, 210, 320 XP … */
export function levelFor(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  let floor = 0;
  let span = 50;
  while (xp >= floor + span) {
    floor += span;
    level++;
    span += 20;
  }
  return { level, into: xp - floor, span };
}
