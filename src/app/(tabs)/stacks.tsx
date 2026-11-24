import { router } from 'expo-router';
import { useState } from 'react';
import { AdBanner } from '@/kit/ads';
import { usePremium } from '@/kit/premium';
import { formatGBP } from '@/kit/money';
import { PaywallSheet } from '@/kit/Paywall';
import { Button, Card, EmptyState, H1, Muted, ProgressBar, Row, Screen, Section, Stack, Strong } from '@/kit/ui';
import { goal, isComplete, progress, saved, TEMPLATES } from '@/domain/challenges';
import { CoinStack } from '@/components/Coins';
import { FREE_CHALLENGES } from '@/brand';
import { useChallenges } from '@/state/stores';

export default function Stacks() {
  const challenges = useChallenges((s) => s.challenges);
  const { isPremium } = usePremium();
  const [paywall, setPaywall] = useState(false);
  const active = challenges.filter((c) => !isComplete(c));
  const done = challenges.filter((c) => isComplete(c));
  const total = challenges.reduce((s, c) => s + saved(c), 0);

  const startNew = () => {
    if (!isPremium && active.length >= FREE_CHALLENGES) setPaywall(true);
    else router.push('/challenge/new');
  };

  return (
    <Screen testID="stacks" banner={<AdBanner placement="stacks_banner" />}>
      <H1>Your stacks</H1>
      {challenges.length ? <Muted testID="stacks-total">{`${formatGBP(total, { whole: true })} stacked so far, across every challenge.`}</Muted> : null}

      {challenges.length === 0 ? (
        <EmptyState icon="layers-outline" title="No stacks yet" body="Pick a challenge and stack your first coin. Most people start with £1." action={<Button title="Pick a challenge" onPress={startNew} testID="stacks-new" />} />
      ) : (
        <>
          <Section title="Active">
            {active.length === 0 ? <Muted>Nothing active. Ready for the next one?</Muted> : null}
            {active.map((c) => (
              <Card key={c.id} onPress={() => router.push(`/challenge/${c.id}`)} testID={`stack-${c.id}`} accessibilityLabel={`${c.name}, ${Math.round(progress(c) * 100)} percent`}>
                <Row gap={14}>
                  <CoinStack progress={progress(c)} size={56} />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Strong>{c.name}</Strong>
                    <Muted>{c.kind === 'nospend' ? `${Math.round(progress(c) * 100)}% of weekends kept` : `${formatGBP(saved(c), { whole: true })} of ${formatGBP(goal(c), { whole: true })}`}</Muted>
                    <ProgressBar value={progress(c)} label={`${c.name} progress`} />
                  </Stack>
                </Row>
              </Card>
            ))}
          </Section>
          <Button title="Start another challenge" icon="add" variant="secondary" onPress={startNew} testID="stacks-new" />
          {done.length ? (
            <Section title="Completed">
              {done.map((c) => (
                <Card key={c.id} onPress={() => router.push(`/challenge/${c.id}`)}>
                  <Row gap={14}>
                    <CoinStack progress={1} size={48} flag />
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Strong>{c.name}</Strong>
                      <Muted>{c.kind === 'nospend' ? 'Every weekend kept' : `${formatGBP(saved(c), { whole: true })} stacked`}</Muted>
                    </Stack>
                  </Row>
                </Card>
              ))}
            </Section>
          ) : null}
        </>
      )}
      <Muted>{`${TEMPLATES.length} challenges to choose from. Free includes one at a time.`}</Muted>
      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason="Free StackUp runs one challenge at a time. Premium lets you stack as many as you like." />
    </Screen>
  );
}
