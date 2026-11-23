// Captures the core screens for review: npx playwright test e2e/screens.spec.ts
import { test } from '@playwright/test';
import lessons from '../src/content/lessons.json';

const out = (n: string) => `../docs/pilots/screens/stackup-${n}.png`;

test('screens', async ({ page }) => {
  test.skip(!process.env.SCREENS, 'set SCREENS=1 to capture');
  await page.goto('/');
  await page.screenshot({ path: out('1-intro') });
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await page.getByTestId('safe-setup-go').click();
  await page.getByTestId('bill-name').fill('Phone');
  await page.getByTestId('bill-amount').fill('22');
  await page.getByTestId('bill-day').fill('28');
  await page.getByTestId('bill-add').click();
  await page.getByTestId('pay-save').click();
  await page.getByTestId('safe-enter-balance').click();
  await page.getByTestId('balance-input').fill('412.50');
  await page.getByTestId('balance-save').click();
  await page.getByTestId('today-new-challenge').click();
  await page.getByTestId('template-week52').click();
  await page.getByTestId('challenge-start').click();
  for (const s of [1, 2, 3, 4, 7, 9]) await page.getByTestId(`slot-${s}`).click();
  await page.waitForTimeout(2800);
  await page.screenshot({ path: out('3-challenge'), fullPage: true });
  await page.goto('/');
  await page.getByTestId('today').waitFor();
  await page.screenshot({ path: out('2-today'), fullPage: true });
  await page.goto('/learn');
  await page.getByTestId('lesson').waitFor();
  await page.getByTestId(`quiz-${lessons.lessons[0].quiz.answer}`).click();
  await page.waitForTimeout(2800);
  await page.screenshot({ path: out('4-learn'), fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.getByTestId('today').waitFor();
  await page.screenshot({ path: out('5-today-dark'), fullPage: true });
});
