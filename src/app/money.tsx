import { router } from 'expo-router';
import { useState } from 'react';
import { track } from '@/kit/analytics';
import { addDays, todayKey, type DayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { DateStepper, MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { Body, Button, Card, Divider, Field, IconButton, Muted, Row, Screen, Section, Segmented, Stack, Strong } from '@/kit/ui';
import { FREQUENCIES, nextPayday, type Frequency } from '@/domain/safe';
import { FREE_BILLS } from '@/brand';
import { useMoney } from '@/state/stores';

const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

export default function MoneySetup() {
  const m = useMoney();
  const { isPremium } = usePremium();
  const { toast } = useFeedback();
  const today = todayKey();
  const [freq, setFreq] = useState<Frequency>(m.pay?.frequency ?? 'monthly');
  const [payday, setPayday] = useState<DayKey>(m.pay ? nextPayday(m.pay, today) : addDays(today, 7));
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<Pence | null>(null);
  const [day, setDay] = useState('');
  const [paywall, setPaywall] = useState(false);
  const dayNum = Number(day);
  const dayOk = Number.isInteger(dayNum) && dayNum >= 1 && dayNum <= 31;

  const addBill = () => {
    if (!isPremium && m.bills.length >= FREE_BILLS) {
      setPaywall(true);
      return;
    }
    m.addBill({ name: name.trim(), amount: amount!, day: dayNum });
    setName('');
    setAmount(null);
    setDay('');
    toast('Bill added.');
  };

  return (
    <Screen edges={[]} testID="money">
      <Section title="Your pay">
        <Card>
          <Segmented label="How often are you paid?" options={FREQUENCIES} value={freq} onChange={setFreq} testID="pay-frequency" />
          <DateStepper label="Your next payday" value={payday} onChange={setPayday} min={today} max={addDays(today, 62)} testID="payday" />
          <Button
            title={m.pay ? 'Update payday' : 'Save payday'}
            testID="pay-save"
            onPress={() => {
              m.setPay({ frequency: freq, anchor: payday });
              track('core_action_completed', { what: 'pay_setup', frequency: freq });
              toast('Payday saved.');
              if (m.balance == null) router.back();
            }}
          />
          <Muted>Irregular pay? Pick the date you next expect money in and update it when you know more.</Muted>
        </Card>
      </Section>

      <Section title="Regular bills">
        <Card>
          <Muted>Rent, phone, subscriptions… anything that leaves your account on a set day each month. StackUp keeps that money aside.</Muted>
          {m.bills.map((b) => (
            <Row key={b.id} style={{ justifyContent: 'space-between' }}>
              <Stack gap={0} style={{ flex: 1 }}>
                <Body>{b.name || 'Bill'}</Body>
                <Muted>{`${formatGBP(b.amount)} on the ${ordinal(b.day)}`}</Muted>
              </Stack>
              <IconButton icon="trash-outline" label={`Remove ${b.name}`} onPress={() => m.removeBill(b.id)} />
            </Row>
          ))}
          {m.bills.length ? <Divider /> : null}
          <Field label="Bill name" value={name} onChangeText={setName} placeholder="e.g. Phone" maxLength={40} testID="bill-name" />
          <MoneyField label="Amount" value={amount} onChange={setAmount} testID="bill-amount" />
          <Field label="Day of the month it goes out" value={day} onChangeText={setDay} inputMode="numeric" keyboardType="number-pad" placeholder="1–31" maxLength={2} testID="bill-day" error={day && !dayOk ? 'Enter a day from 1 to 31' : null} hint="If a month is shorter, we use its last day." />
          <Button title="Add bill" icon="add" variant="secondary" disabled={!name.trim() || !amount || !dayOk} onPress={addBill} testID="bill-add" />
          {!isPremium ? <Muted>{`Free includes ${FREE_BILLS} bills. Premium has no limit.`}</Muted> : null}
        </Card>
      </Section>
      <Strong>{m.pay ? 'All set. Your safe-to-spend is on the Today screen.' : ''}</Strong>
      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason={`Free StackUp keeps ${FREE_BILLS} bills aside. Premium handles every bill and subscription.`} />
    </Screen>
  );
}
