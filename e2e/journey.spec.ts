import { expect, test, type Page } from '@playwright/test';
import lessons from '../src/content/lessons.json';

async function finishIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.getByTestId('intro-next').click();
  await page.getByTestId('intro-next').click();
  await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('today')).toBeVisible();
}

test('first open → challenge → stack → persists after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await finishIntro(page);

  await page.getByTestId('today-new-challenge').click();
  await page.getByTestId('template-week52').click();
  await page.getByTestId('challenge-start').click();
  await expect(page.getByTestId('challenge')).toBeVisible();
  await expect(page.getByTestId('challenge-saved')).toHaveText('£0');

  await page.getByTestId('slot-stack-next').click();
  await expect(page.getByTestId('toast')).toContainText('Week 1: £1 stacked.');
  await expect(page.getByTestId('challenge-saved')).toHaveText('£1');
  await page.getByTestId('slot-5').click(); // any order is fine
  await expect(page.getByTestId('challenge-saved')).toHaveText('£6');

  // Undo from the toast
  await page.getByTestId('toast-action').click();
  await expect(page.getByTestId('challenge-saved')).toHaveText('£1');

  await page.reload();
  await expect(page.getByTestId('challenge-saved')).toHaveText('£1');
  expect(errors).toEqual([]);
});

test('safe to spend: payday + balance gives a daily number, and "can I afford" answers', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('safe-setup-go').click();
  await expect(page.getByTestId('money')).toBeVisible();
  // Add a bill
  await page.getByTestId('bill-name').fill('Phone');
  await page.getByTestId('bill-amount').fill('15');
  await page.getByTestId('bill-day').fill('31');
  await page.getByTestId('bill-add').click();
  await expect(page.getByText('£15.00 on the 31st')).toBeVisible();
  // Payday 7 days from today (the default), then save
  await page.getByTestId('pay-save').click();
  await expect(page.getByTestId('safe-card')).toBeVisible();

  await page.getByTestId('safe-enter-balance').click();
  await page.getByTestId('balance-input').fill('500');
  await page.getByTestId('balance-save').click();
  await expect(page.getByTestId('safe-per-day')).toHaveText(/£\d+\.\d\d/);

  await page.getByTestId('safe-afford').click();
  await page.getByTestId('afford-input').fill('9999');
  await expect(page.getByText(/Not before payday/)).toBeVisible();
  await page.getByTestId('afford-input').fill('20');
  await expect(page.getByText(/^Yes\. You'd still have/)).toBeVisible();
});

test('daily lesson: answer the quiz, earn XP, and the lesson stays done', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('today-lesson').click();
  await expect(page.getByTestId('lesson')).toBeVisible();
  const right = lessons.lessons[0].quiz.answer;
  await page.getByTestId(`quiz-${right}`).click();
  await expect(page.getByTestId('lesson-done')).toBeVisible();
  await expect(page.getByTestId('learn-xp')).toHaveText('10 XP');
  await page.reload();
  await expect(page.getByTestId('lesson-done')).toBeVisible();
  await expect(page.getByTestId('learn-xp')).toHaveText('10 XP');
});

test('free tier: a second challenge opens the paywall, which says it is test mode', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('today-new-challenge').click();
  await page.getByTestId('template-target').click();
  await page.getByTestId('challenge-start').click();
  await expect(page.getByTestId('challenge')).toBeVisible();
  await page.goto('/stacks');
  await page.getByTestId('stacks-new').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
  await expect(page.getByText(/Test mode: no real purchase|Premium is coming soon/)).toBeVisible();
});

test('settings: delete all data really deletes it', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('today-new-challenge').click();
  await page.getByTestId('template-envelopes').click();
  await page.getByTestId('challenge-start').click();
  await page.getByTestId('envelope-open').click();
  await page.getByTestId('envelope-stack').click();
  await page.goto('/settings');
  await page.getByTestId('settings-delete').click();
  await page.getByTestId('confirm-yes').click();
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('intro')).toBeVisible();
  await finishIntro(page);
  await expect(page.getByTestId('no-challenge')).toBeVisible();
  await page.goto('/stacks');
  await expect(page.getByText('No stacks yet')).toBeVisible();
});

test('themes: switch theme in Settings and it sticks; lesson library locks after 20 free cards', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.goto('/settings');
  await page.getByTestId('theme-burgundy').click();
  await expect(page.getByTestId('theme-burgundy')).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(page.getByTestId('theme-burgundy')).toHaveAttribute('aria-checked', 'true');
  await page.goto('/learn');
  await expect(page.getByTestId('cards-progress')).toContainText('20 free');
  await page.getByTestId('card-l21').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
  await page.getByTestId('sheet-close').click();
  await page.getByTestId('card-l02').click();
  await expect(page.getByTestId('card-sheet')).toBeVisible();
});
