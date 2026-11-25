// Kaotic Chainz app kit: start-up animation.
import { LETTERS, MARK_SCALE, MARK_X } from '../startup/layout';
import { finishStartup, startupFinished, whenStartupDone } from '../startup/state';
import { DURATION, HIT, frameAt, sampleTimes, stageFor } from '../startup/timeline';

const stage = stageFor(390, 844);

describe('start-up animation', () => {
  it('starts with both links off screen and no letters', () => {
    const f = frameAt(0, stage);
    expect(f.red.x).toBeLessThan(-stage.width / 2);
    expect(f.lime.x).toBeGreaterThan(stage.width / 2);
    expect(f.letters.every((l) => l.opacity === 0)).toBe(true);
    expect(f.joined).toBe(false);
  });

  it('joins the links at the hit and sparks only just after it', () => {
    expect(frameAt(HIT - 0.01, stage).joined).toBe(false);
    expect(frameAt(HIT, stage).joined).toBe(true);
    expect(frameAt(HIT + 0.1, stage).sparks.every((s) => s.opacity === 1)).toBe(true);
    expect(frameAt(DURATION, stage).sparks.every((s) => s.opacity === 0)).toBe(true);
  });

  it('ends as the finished word, with the links in their slot', () => {
    const f = frameAt(DURATION, stage);
    const scale = stage.word / 1000;
    expect((f.red.x + f.lime.x) / 2).toBeCloseTo(MARK_X * scale, 1);
    expect(f.red.scale * stage.hero).toBeCloseTo(MARK_SCALE * scale, 1);
    expect(f.red.rotate).toBeCloseTo(0);
    expect(f.letters).toHaveLength(LETTERS.length);
    expect(f.letters.every((l) => l.opacity === 1 && Math.abs(l.dx) < 0.01)).toBe(true);
  });

  it('keeps the word inside narrow phones and stops growing on tablets', () => {
    expect(stageFor(320, 640).word).toBeLessThan(320);
    expect(stageFor(1200, 1600).word).toBe(620);
  });

  it('samples in increasing order from 0 to the end, including the hit', () => {
    const times = sampleTimes();
    expect(times[0]).toBe(0);
    expect(times[times.length - 1]).toBeCloseTo(DURATION);
    expect(times).toContain(HIT);
    expect(times.every((t, i) => i === 0 || t > times[i - 1])).toBe(true);
  });

  it('releases whatever waits for it, once', async () => {
    const seen: string[] = [];
    const waiting = whenStartupDone().then(() => seen.push('done'));
    expect(startupFinished()).toBe(false);
    finishStartup();
    finishStartup();
    await waiting;
    await whenStartupDone();
    expect(seen).toEqual(['done']);
  });
});
