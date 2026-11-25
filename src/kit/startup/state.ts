// Whether the start-up animation has finished. Anything full-screen at launch (the app-open ad,
// the All Access offer) waits for it, so nothing covers the animation.
let finished = false;
const waiting: (() => void)[] = [];

export const startupFinished = () => finished;

export function finishStartup(): void {
  if (finished) return;
  finished = true;
  waiting.splice(0).forEach((resolve) => resolve());
}

export function whenStartupDone(): Promise<void> {
  return finished ? Promise.resolve() : new Promise((resolve) => waiting.push(resolve));
}
