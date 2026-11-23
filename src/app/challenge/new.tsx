import { router } from 'expo-router';
import { useState } from 'react';
import { track } from '@/kit/analytics';
import { addDays, diffDays, todayKey, weekday, type DayKey } from '@/kit/dates';
import { DateStepper, MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { Body, Button, Card, Chip, H2, Muted, Row, Screen, Stack, Strong, Toggle } from '@/kit/ui';
import { goal, TEMPLATES, type Challenge, type ChallengeKind } from '@/domain/challenges';
import { useChallenges } from '@/state/stores';

const DAY_OPTIONS = [30, 100, 365];
const TARGET_DAYS = [30, 60, 90, 180];

export default function NewChallenge() {
  const today = todayKey();
  const [kind, setKind] = useState<ChallengeKind | null>(null);
  const t = TEMPLATES.find((x) => x.kind === kind);
  const [start, setStart] = useState<DayKey>(today);
  const [reverse, setReverse] = useState(false);
  const [perDay, setPerDay] = useState<Pence | null>(500);
  const [days, setDays] = useState(100);
  const [goalAmt, setGoalAmt] = useState<Pence | null>(100_000);
  const [targetDays, setTargetDays] = useState(90);
  const [weekends, setWeekends] = useState(8);

  const nextMonday = addDays(today, (8 - weekday(today)) % 7 || 7);
  const newYear = `${Number(today.slice(0, 4)) + 1}-01-01`;

  const params = (): Challenge['params'] => {
    switch (kind) {
      case 'week52':
        return { unit: 100, reverse };
      case 'envelopes':
        return { unit: 100 };
      case 'daily':
        return { perDay: perDay ?? 0, days };
      case 'target':
        return { goal: goalAmt ?? 0, days: targetDays };
      case 'nospend':
        return { weekends };
      default:
        return {};
    }
  };
  const name = () => {
    if (kind === 'daily') return `${formatGBP(perDay ?? 0, { whole: true })} a day for ${days} days`;
    if (kind === 'target') return `${formatGBP(goalAmt ?? 0, { whole: true })} in ${targetDays} days`;
    if (kind === 'nospend') return `${weekends} no-spend weekends`;
    return t?.name ?? '';
  };
  const invalid = (kind === 'daily' && !perDay) || (kind === 'target' && !goalAmt);
  const preview: Challenge | null = kind ? { id: 'p', kind, name: name(), start, params: params(), deposits: [] } : null;

  if (!kind) {
    return (
      <Screen edges={[]} testID="new-challenge">
        <Body>Pick a challenge. You can run it at your own pace, and nothing bad happens if you fall behind.</Body>
        {TEMPLATES.map((x) => (
          <Card key={x.kind} onPress={() => setKind(x.kind)} testID={`template-${x.kind}`} accessibilityLabel={`${x.name}. ${x.blurb}`}>
            <Row gap={12} style={{ alignItems: 'flex-start' }}>
              <Body style={{ fontSize: 30 }}>{x.emoji}</Body>
              <Stack gap={4} style={{ flex: 1 }}>
                <Strong>{x.name}</Strong>
                <Muted>{x.blurb}</Muted>
              </Stack>
            </Row>
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <Screen
      edges={[]}
      testID="new-challenge-setup"
      footer={
        <Button
          title="Start this challenge"
          disabled={invalid}
          testID="challenge-start"
          onPress={() => {
            const id = useChallenges.getState().start(kind, name(), params(), start);
            track('core_action_completed', { what: 'challenge_started', kind });
            router.replace(`/challenge/${id}`);
          }}
        />
      }
    >
      <Row gap={10}>
        <Body style={{ fontSize: 30 }}>{t!.emoji}</Body>
        <H2>{t!.name}</H2>
      </Row>
      <Muted>{t!.blurb}</Muted>

      {kind === 'week52' ? <Toggle label="Reverse order" hint="Start with £52 while motivation is high, finish with £1." value={reverse} onChange={setReverse} /> : null}
      {kind === 'daily' ? (
        <>
          <MoneyField label="Amount each day" value={perDay} onChange={setPerDay} testID="per-day" />
          <Row wrap gap={8}>
            {DAY_OPTIONS.map((d) => (
              <Chip key={d} label={`${d} days`} selected={days === d} onPress={() => setDays(d)} />
            ))}
          </Row>
        </>
      ) : null}
      {kind === 'target' ? (
        <>
          <MoneyField label="Goal" value={goalAmt} onChange={setGoalAmt} testID="goal" />
          <Row wrap gap={8}>
            {TARGET_DAYS.map((d) => (
              <Chip key={d} label={`${d} days`} selected={targetDays === d} onPress={() => setTargetDays(d)} />
            ))}
          </Row>
        </>
      ) : null}
      {kind === 'nospend' ? (
        <Row wrap gap={8}>
          {[4, 8, 12].map((n) => (
            <Chip key={n} label={`${n} weekends`} selected={weekends === n} onPress={() => setWeekends(n)} />
          ))}
        </Row>
      ) : null}

      <Stack gap={8}>
        <DateStepper label="Start on" value={start} onChange={setStart} min={addDays(today, -60)} testID="start-date" />
        <Row wrap gap={8}>
          <Chip label="Today" selected={start === today} onPress={() => setStart(today)} />
          <Chip label="Next Monday" selected={start === nextMonday} onPress={() => setStart(nextMonday)} />
          {diffDays(today, newYear) <= 60 ? <Chip label="1 January" selected={start === newYear} onPress={() => setStart(newYear)} /> : null}
        </Row>
      </Stack>

      {preview && kind !== 'nospend' ? (
        <Card tone="alt">
          <Strong>{`Goal: ${formatGBP(goal(preview), { whole: true })}`}</Strong>
          {kind === 'target' && goalAmt ? <Muted>{`That's about ${formatGBP(Math.ceil((goalAmt ?? 0) / targetDays))} a day, or ${formatGBP(Math.ceil(((goalAmt ?? 0) * 7) / targetDays))} a week.`}</Muted> : null}
        </Card>
      ) : null}
      <Button title="Choose a different challenge" variant="ghost" onPress={() => setKind(null)} />
    </Screen>
  );
}
