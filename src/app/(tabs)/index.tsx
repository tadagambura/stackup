import { router } from 'expo-router';
import { useState } from 'react';
import { formatDay, todayKey } from '@/kit/dates';
import { MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { computeStreak } from '@/kit/streak';
import { Body, Button, Card, H1, Label, Muted, ProgressBar, Row, Screen, Sheet, Stack, Strong } from '@/kit/ui';
import { goal, isComplete, nextSlot, progress, saved, slotLabel, type Challenge } from '@/domain/challenges';
import { lessonForDay } from '@/domain/lessons';
import { safeToSpend } from '@/domain/safe';
import { CoinStack } from '@/components/Coins';
import { SafeCard } from '@/components/SafeCard';
import { useStack } from '@/components/useStack';
import { pack } from '@/content/lessons';
import { currentBalance, useChallenges, useLearn, useMoney } from '@/state/stores';
import '@/arcade';
import { ArcadeEntry } from '@/kit/arcade/screens';

function QuickStack({ c }: { c: Challenge }) {
  const stack = useStack();
  const today = todayKey();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<Pence | null>(null);
  const next = nextSlot(c, today);
  return (
    <Card testID="quick-stack">
      <Row style={{ alignItems: 'flex-start' }} gap={14}>
        <CoinStack progress={progress(c)} size={72} />
        <Stack gap={6} style={{ flex: 1 }}>
          <Strong>{c.name}</Strong>
          <Muted>{c.kind === 'nospend' ? `${Math.round(progress(c) * 100)}% of weekends kept` : `${formatGBP(saved(c), { whole: true })} of ${formatGBP(goal(c), { whole: true })}`}</Muted>
          <ProgressBar value={progress(c)} label={`${c.name} progress`} />
        </Stack>
      </Row>
      {c.kind === 'target' ? (
        <Button title="Stack some money" icon="add-circle-outline" onPress={() => setOpen(true)} testID="quick-stack-go" />
      ) : c.kind === 'envelopes' ? (
        <Button title="Open an envelope" icon="mail-open-outline" onPress={() => router.push(`/challenge/${c.id}`)} testID="quick-stack-go" />
      ) : next ? (
        <Button
          title={c.kind === 'nospend' ? `Kept ${slotLabel(c, next.slot).toLowerCase()} spend-free` : `Stack ${slotLabel(c, next.slot).toLowerCase()}: ${formatGBP(next.amount, { whole: true })}`}
          icon="add-circle-outline"
          onPress={() => stack(c, next.amount, next.slot)}
          testID="quick-stack-go"
        />
      ) : null}
      <Button small variant="ghost" title="See the whole stack" onPress={() => router.push(`/challenge/${c.id}`)} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={`Stack into ${c.name}`}>
        <Stack>
          <MoneyField label="Amount" value={amount} onChange={setAmount} autoFocus testID="quick-amount" />
          <Button
            title="Stack it"
            disabled={!amount}
            testID="quick-amount-save"
            onPress={() => {
              if (stack(c, amount!)) {
                setOpen(false);
                setAmount(null);
              }
            }}
          />
        </Stack>
      </Sheet>
    </Card>
  );
}

function LeftoverCard({ c }: { c: Challenge }) {
  const m = useMoney();
  const stack = useStack();
  const today = todayKey();
  const bal = currentBalance(m);
  if (!m.pay || bal == null || c.kind !== 'target') return null;
  const r = safeToSpend(bal, m.pay, m.bills, today);
  if (r.daysLeft !== 1 || r.safeTotal <= 0) return null;
  const leftover = Math.floor(r.safeTotal / 100) * 100;
  if (leftover < 100) return null;
  return (
    <Card tone="alt" testID="leftover">
      <Strong>{`Payday's tomorrow and you've got ${formatGBP(r.safeTotal)} left.`}</Strong>
      <Body>{`Stack ${formatGBP(leftover, { whole: true })} of it into ${c.name}?`}</Body>
      <Button title={`Stack ${formatGBP(leftover, { whole: true })}`} variant="accent" onPress={() => stack(c, leftover)} />
    </Card>
  );
}

export default function Today() {
  const challenges = useChallenges((s) => s.challenges);
  const learn = useLearn();
  const today = todayKey();
  const active = challenges.filter((c) => !isComplete(c));
  const lesson = lessonForDay(pack, learn.firstDay ?? today, today);
  const answered = learn.answers[today];
  const streak = computeStreak({ done: Object.keys(learn.answers), start: learn.firstDay ?? today, today });

  return (
    <Screen testID="today">
      <Stack gap={2}>
        <Muted>{formatDay(today, 'long')}</Muted>
        <H1>Today</H1>
      </Stack>

      <SafeCard />

      {active.length ? (
        <>
          <LeftoverCard c={active.find((c) => c.kind === 'target') ?? active[0]} />
          <QuickStack c={active[0]} />
        </>
      ) : (
        <Card testID="no-challenge">
          <Row gap={14}>
            <CoinStack progress={0.15} size={72} />
            <Stack gap={6} style={{ flex: 1 }}>
              <Strong>Start a savings challenge</Strong>
              <Muted>52 weeks, 100 envelopes, £1,000 in 90 days… pick one and stack your first coin today.</Muted>
            </Stack>
          </Row>
          <Button title="Pick a challenge" onPress={() => router.push('/challenge/new')} testID="today-new-challenge" />
        </Card>
      )}

      <Card onPress={() => router.push('/learn')} testID="today-lesson" accessibilityLabel={`Today's lesson: ${lesson.title}`}>
        <Label>{answered ? "Today's lesson: done" : "Today's 60-second lesson"}</Label>
        <Strong>{lesson.title}</Strong>
        <Muted>{answered ? `${answered.correct ? 'Nailed it.' : 'Learned something.'} Back tomorrow for the next one. ${streak.current > 1 ? `${streak.current}-day learning streak.` : ''}` : `${lesson.topic} · tap to learn and take the quiz`}</Muted>
      </Card>
      <ArcadeEntry />
    </Screen>
  );
}
