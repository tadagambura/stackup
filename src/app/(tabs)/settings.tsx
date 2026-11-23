import { router } from 'expo-router';
import { formatGBP } from '@/kit/money';
import { formatDay, todayKey } from '@/kit/dates';
import { KitSettings } from '@/kit/Settings';
import { Card, ListRow, Section } from '@/kit/ui';
import { nextPayday } from '@/domain/safe';
import { useMoney } from '@/state/stores';

export default function Settings() {
  const m = useMoney();
  return (
    <KitSettings
      reminder={{
        title: 'StackUp',
        body: "Your safe-to-spend and today's 60-second lesson are ready.",
        explain: 'One gentle nudge a day. Never more.',
      }}
    >
      <Section title="Money">
        <Card>
          <ListRow
            icon="calendar-outline"
            title="Payday and bills"
            subtitle={m.pay ? `Next payday ${formatDay(nextPayday(m.pay, todayKey()))} · ${m.bills.length} bills (${formatGBP(m.bills.reduce((s, b) => s + b.amount, 0))})` : 'Not set up yet'}
            onPress={() => router.push('/money')}
            testID="settings-money"
          />
        </Card>
      </Section>
    </KitSettings>
  );
}
