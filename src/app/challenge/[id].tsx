import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { formatDay, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, EmptyState, H1, Label, Muted, Note, ProgressBar, Row, Screen, Section, Stack, Strong } from '@/kit/ui';
import { goal, isComplete, nextSlot, pace, pickEnvelope, progress, saved, slotLabel, slots, type Slot } from '@/domain/challenges';
import { CoinStack } from '@/components/Coins';
import { useStack } from '@/components/useStack';
import { useChallenges } from '@/state/stores';

function SlotGrid({ items, onPick, label }: { items: Slot[]; onPick: (s: Slot) => void; label: (s: Slot) => string }) {
  const { c, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {items.map((s) => (
        <Pressable
          key={s.slot}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: s.done }}
          accessibilityLabel={`${label(s)}${s.done ? ', stacked' : ''}`}
          onPress={() => !s.done && onPick(s)}
          testID={`slot-${s.slot}`}
          style={{ width: 44, height: 44, borderRadius: radius - 4, alignItems: 'center', justifyContent: 'center', backgroundColor: s.done ? c.accent : c.surface, borderWidth: 1.5, borderColor: s.done ? c.text : c.border }}
        >
          <Text style={{ color: s.done ? c.accentText : c.text, fontWeight: '700', fontSize: 13 }}>{s.slot}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useChallenges((s) => s.challenges.find((x) => x.id === id));
  const stack = useStack();
  const { confirm, toast } = useFeedback();
  const [amount, setAmount] = useState<Pence | null>(null);
  const [envelope, setEnvelope] = useState<Slot | null>(null);
  const [extra, setExtra] = useState<Pence | null>(null);
  const today = todayKey();

  if (!c) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="help-circle-outline" title="This challenge isn't here" body="It may have been deleted." action={<Button title="Back to your stacks" onPress={() => router.replace('/stacks')} />} />
      </Screen>
    );
  }

  const p = pace(c, today);
  const next = nextSlot(c, today);
  const done = isComplete(c);
  const all = slots(c);

  return (
    <Screen edges={[]} testID="challenge">
      <RouterStack.Screen options={{ title: c.name }} />
      <Row gap={16}>
        <CoinStack progress={progress(c)} size={110} flag={done} />
        <Stack gap={4} style={{ flex: 1 }}>
          <Label>{done ? 'Complete' : 'Stacked so far'}</Label>
          <H1 testID="challenge-saved">{c.kind === 'nospend' ? `${all.filter((s) => s.done).length} of ${all.length}` : formatGBP(saved(c), { whole: saved(c) % 100 === 0 })}</H1>
          <Muted>{c.kind === 'nospend' ? 'weekends kept spend-free' : `of ${formatGBP(goal(c), { whole: true })}`}</Muted>
        </Stack>
      </Row>
      <ProgressBar value={progress(c)} label="Challenge progress" />
      {p.state === 'ahead' ? <Note>{`You're ${formatGBP(p.diff, { whole: true })} ahead of the plan. Lovely.`}</Note> : null}
      {p.state === 'on-track' ? <Note>Right on track.</Note> : null}
      {p.state === 'catch-up' && !done ? <Note>{`${formatGBP(p.diff, { whole: true })} would bring you level with the plan. No rush: any amount counts.`}</Note> : null}

      {done ? (
        <Card tone="alt">
          <Strong>{`Done${c.completedOn ? ` on ${formatDay(c.completedOn)}` : ''}. The flag is on top of the stack.`}</Strong>
          <Button title="Start another challenge" onPress={() => router.push('/challenge/new')} />
        </Card>
      ) : null}

      {!done && c.kind === 'target' ? (
        <Card>
          <MoneyField label="Stack an amount" value={amount} onChange={setAmount} testID="target-amount" />
          <Button
            title="Stack it"
            disabled={!amount}
            testID="target-stack"
            onPress={() => {
              if (stack(c, amount!)) setAmount(null);
            }}
          />
        </Card>
      ) : null}

      {!done && (c.kind === 'week52' || c.kind === 'daily') && next ? (
        <Card>
          <Strong>{`Next up: ${slotLabel(c, next.slot)} (${formatDay(next.due)})`}</Strong>
          <Button title={`Stack ${formatGBP(next.amount, { whole: true })}`} icon="add-circle-outline" onPress={() => stack(c, next.amount, next.slot)} testID="slot-stack-next" />
          <Muted>Or tap any square below to stack that one. Order doesn't matter.</Muted>
        </Card>
      ) : null}

      {!done && c.kind === 'envelopes' ? (
        <Card>
          {envelope ? (
            <>
              <Body center style={{ fontSize: 44 }}>✉️</Body>
              <Strong center testID="envelope-picked">{`Envelope ${envelope.slot}: ${formatGBP(envelope.amount, { whole: true })}`}</Strong>
              <Button
                title={`Stack ${formatGBP(envelope.amount, { whole: true })}`}
                onPress={() => {
                  if (stack(c, envelope.amount, envelope.slot)) setEnvelope(null);
                }}
                testID="envelope-stack"
              />
              <Button title="Pick a different one" variant="ghost" onPress={() => setEnvelope(pickEnvelope(c))} />
            </>
          ) : (
            <Button title="Open a random envelope" icon="mail-open-outline" onPress={() => setEnvelope(pickEnvelope(c))} testID="envelope-open" />
          )}
        </Card>
      ) : null}

      {!done && c.kind === 'nospend' && next ? (
        <Card>
          <Strong>{`${slotLabel(c, next.slot)}: ${formatDay(next.due)}`}</Strong>
          <MoneyField label="Stack what you'd have spent (optional)" value={extra} onChange={setExtra} testID="nospend-amount" />
          <Button
            title="I kept it spend-free"
            onPress={() => {
              if (stack(c, extra ?? 0, next.slot)) setExtra(null);
            }}
            testID="nospend-keep"
          />
        </Card>
      ) : null}

      {all.length ? (
        <Section title={c.kind === 'envelopes' ? 'Envelopes' : c.kind === 'nospend' ? 'Weekends' : c.kind === 'week52' ? 'Weeks' : 'Days'}>
          <SlotGrid
            items={all}
            label={(s) => `${slotLabel(c, s.slot)}, ${formatGBP(s.amount, { whole: true })}`}
            onPick={(s) => (c.kind === 'envelopes' ? setEnvelope(s) : c.kind === 'nospend' ? stack(c, extra ?? 0, s.slot) : stack(c, s.amount, s.slot))}
          />
        </Section>
      ) : null}

      <Section title="Recent">
        {c.deposits.length === 0 ? <Muted>Nothing stacked yet. The first coin is the hardest.</Muted> : null}
        {[...c.deposits]
          .reverse()
          .slice(0, 8)
          .map((d) => (
            <Row key={d.id} style={{ justifyContent: 'space-between' }}>
              <Body>{`${d.slot != null ? slotLabel(c, d.slot) + ' · ' : ''}${formatDay(d.day)}`}</Body>
              <Row gap={10}>
                <Strong>{c.kind === 'nospend' && d.amount === 0 ? 'Kept' : formatGBP(d.amount, { whole: d.amount % 100 === 0 })}</Strong>
                <Button small variant="ghost" title="Undo" accessibilityLabel={`Undo ${formatGBP(d.amount)} on ${formatDay(d.day)}`} onPress={() => useChallenges.getState().undo(c.id, d.id)} />
              </Row>
            </Row>
          ))}
      </Section>

      <Button
        title="Delete this challenge"
        variant="danger"
        testID="challenge-delete"
        onPress={async () => {
          const ok = await confirm({ title: 'Delete this challenge?', body: `${c.name} and its ${c.deposits.length} deposits will be removed from this device.`, confirmLabel: 'Delete', destructive: true });
          if (!ok) return;
          const removed = useChallenges.getState().remove(c.id);
          router.back();
          toast('Challenge deleted.', { actionLabel: 'Undo', onAction: () => removed && useChallenges.getState().restore(removed) });
        }}
      />
    </Screen>
  );
}
