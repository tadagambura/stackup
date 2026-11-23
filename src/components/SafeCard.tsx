// The safe-to-spend card on Today: the number, the payday countdown, spend logging and "can I afford it?".
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { track } from '@/kit/analytics';
import { formatDay, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, Label, Muted, Note, Row, Sheet, Stack, Strong } from '@/kit/ui';
import { canAfford, safeToSpend } from '@/domain/safe';
import { currentBalance, useMoney } from '@/state/stores';

export function SafeCard() {
  const { c, font } = useTheme();
  const m = useMoney();
  const { toast } = useFeedback();
  const [sheet, setSheet] = useState<null | 'spend' | 'balance' | 'afford'>(null);
  const [amount, setAmount] = useState<Pence | null>(null);
  const today = todayKey();
  const bal = currentBalance(m);

  if (!m.pay) {
    return (
      <Card testID="safe-setup">
        <Label>Safe to spend</Label>
        <Strong>{"Find out what's safe to spend until payday"}</Strong>
        <Muted>Add your payday and regular bills. Takes about a minute, and nothing leaves your phone.</Muted>
        <Button title="Set up payday" icon="calendar-outline" onPress={() => router.push('/money')} testID="safe-setup-go" />
      </Card>
    );
  }

  const r = bal != null ? safeToSpend(bal, m.pay, m.bills, today) : null;
  const close = () => {
    setSheet(null);
    setAmount(null);
  };
  const answer = r && amount != null ? canAfford(r, amount) : null;

  return (
    <Card testID="safe-card">
      <Label>Safe to spend today</Label>
      {r ? <Muted testID="safe-payday">{r.isPayday ? "It's payday! 🎉" : `Payday ${formatDay(r.payday)}, ${r.daysLeft === 1 ? 'tomorrow' : `in ${r.daysLeft} days`}`}</Muted> : null}
      {r == null ? (
        <>
          <Body>{"What's in your account right now?"}</Body>
          <Button title="Enter my balance" onPress={() => setSheet('balance')} testID="safe-enter-balance" />
        </>
      ) : r.safeTotal > 0 ? (
        <>
          <Text testID="safe-per-day" style={{ fontFamily: font.display, fontSize: 48, color: c.primary }} maxFontSizeMultiplier={1.3}>
            {formatGBP(r.perDay)}
          </Text>
          <Muted>{`${formatGBP(r.safeTotal)} safe until payday, after ${formatGBP(r.billsTotal)} of bills due before then.`}</Muted>
        </>
      ) : (
        <View style={{ gap: 6 }} testID="safe-zero">
          <Text style={{ fontFamily: font.display, fontSize: 40, color: c.text }}>£0</Text>
          <Body>{"Pockets turned out, a fly buzzes off. Bills come first, and they're covered as best they can be. Payday is on its way."}</Body>
          <Muted>If money is tight every month, MoneyHelper offers free, confidential help: moneyhelper.org.uk</Muted>
        </View>
      )}
      {r ? (
        <Row wrap gap={8}>
          <Button small title="Log a spend" icon="remove-circle-outline" variant="secondary" onPress={() => setSheet('spend')} testID="safe-log-spend" />
          <Button small title="Can I afford…?" icon="help-circle-outline" variant="secondary" onPress={() => setSheet('afford')} testID="safe-afford" />
          <Button small title="Update balance" icon="create-outline" variant="ghost" onPress={() => setSheet('balance')} testID="safe-update-balance" />
        </Row>
      ) : null}
      <Muted>Based only on what you enter. Not financial advice.</Muted>

      <Sheet visible={sheet === 'balance'} onClose={close} title="Your balance now">
        <Stack>
          <MoneyField label="Money in your account" value={amount} onChange={setAmount} autoFocus testID="balance-input" hint="Check your banking app and type the available balance." />
          <Button
            title="Save balance"
            disabled={amount == null}
            testID="balance-save"
            onPress={() => {
              m.setBalance(amount!);
              track('value_delivered', { what: 'safe_to_spend' });
              close();
            }}
          />
        </Stack>
      </Sheet>

      <Sheet visible={sheet === 'spend'} onClose={close} title="Log a spend">
        <Stack>
          <MoneyField label="How much did you spend?" value={amount} onChange={setAmount} autoFocus testID="spend-input" />
          <Button
            title="Log it"
            disabled={!amount}
            testID="spend-save"
            onPress={() => {
              const sp = m.logSpend(amount!);
              toast(`${formatGBP(amount!)} logged.`, { actionLabel: 'Undo', onAction: () => useMoney.getState().undoSpend(sp.id) });
              close();
            }}
          />
        </Stack>
      </Sheet>

      <Sheet visible={sheet === 'afford'} onClose={close} title="Can I afford it?">
        <Stack>
          <MoneyField label="How much is it?" value={amount} onChange={setAmount} autoFocus testID="afford-input" />
          {answer ? (
            <Note tone={answer.verdict === 'no' ? 'warning' : 'info'}>
              {answer.verdict === 'yes'
                ? `Yes. You'd still have ${formatGBP(answer.leftAfter)} until payday, about ${formatGBP(answer.perDayAfter)} a day.`
                : answer.verdict === 'tight'
                  ? `You can, but it's tight: ${formatGBP(answer.leftAfter)} left until payday, about ${formatGBP(answer.perDayAfter)} a day.`
                  : `Not before payday without dipping into bill money. You'd be ${formatGBP(-answer.leftAfter)} short. Could it wait until ${r ? formatDay(r.payday) : 'payday'}?`}
            </Note>
          ) : null}
          <Button title="Done" variant="secondary" onPress={close} />
        </Stack>
      </Sheet>
    </Card>
  );
}
