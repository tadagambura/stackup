// The start-up animation as plain numbers: where everything is at time t (seconds).
// Same motion as the preview video made by scripts/make_banner.mjs.
import { FONT_SIZE, LETTERS, MARK_SCALE, MARK_X } from './layout';

/** The two links meet. */
export const HIT = 0.62;
/** Everything is in its final place well before this; the overlay then fades out. */
export const DURATION = 2.1;
const SPARKS = 10;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, from: number, to: number) => clamp((t - from) / (to - from));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const overshoot = (k: number) => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);

export interface Stage {
  /** Screen width of the finished word. */
  word: number;
  /** Screen points per logo unit while the links are large. */
  hero: number;
  width: number;
}

export function stageFor(width: number, height: number): Stage {
  return { width, word: Math.min(width * 0.88, 620), hero: Math.min((width * 0.62) / 56, (height * 0.4) / 30, 9) };
}

/** Everything is measured from the centre of the screen. */
export function frameAt(t: number, stage: Stage) {
  const s = stage.word / 1000;
  const fly = easeOut(seg(t, 0.08, HIT));
  const open = easeOut(seg(t, 0.95, 1.45));
  const unit = mix(stage.hero, MARK_SCALE * s, open);
  const centre = MARK_X * s * open;
  const bump = t > HIT ? Math.sin((t - HIT) * 34) * Math.exp(-(t - HIT) * 11) : 0;
  const size = unit * (1 + bump * 0.09);
  const away = (1 - fly) * (stage.width * 0.75 + stage.hero * 30);
  const spin = (1 - fly) * 1.9;
  const link = (side: -1 | 1) => ({ x: centre + side * (away + 10 * size), scale: size / stage.hero, rotate: side * spin });
  const letters = LETTERS.map((l) => {
    const p = seg(t, 1 + l.order * 0.05, 1.45 + l.order * 0.05);
    return { dx: (1 - overshoot(p)) * -l.side * FONT_SIZE * 0.9 * s, opacity: clamp(p * 2.2) };
  });
  const k = seg(t, HIT, HIT + 0.38);
  const sparks = Array.from({ length: SPARKS }, (_, i) => {
    const angle = -Math.PI / 2 + (i % 2 ? 1 : -1) * (0.18 + Math.floor(i / 2) * 0.26) + (i > 4 ? Math.PI : 0);
    const inner = stage.hero * (17 + k * 14);
    const radius = inner + (stage.hero * 7 * (1 - k)) / 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, angle, scale: 1 - k, opacity: k > 0 && k < 1 ? 1 : 0 };
  });
  return { red: link(-1), lime: link(1), joined: t >= HIT, letters, sparks };
}

/** Sample points for Animated interpolation: 60 a second, plus the exact moment of the hit. */
export function sampleTimes(): number[] {
  const times = Array.from({ length: Math.round(DURATION * 60) + 1 }, (_, i) => i / 60);
  return [...new Set([...times, HIT])].sort((a, b) => a - b);
}
