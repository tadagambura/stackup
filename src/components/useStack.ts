// One place that turns "stack £X" into a deposit, an undo toast and the right celebration.
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { formatGBP, type Pence } from '@/kit/money';
import { depositError, isComplete, progress, slotLabel, type Challenge } from '@/domain/challenges';
import { useChallenges } from '@/state/stores';

const MILESTONES = [0.25, 0.5, 0.75];

export function useStack() {
  const { toast } = useFeedback();
  const celebrate = useCelebrate();

  return (c: Challenge, amount: Pence, slot?: number): boolean => {
    const err = depositError(c, amount, slot);
    if (err) {
      toast(err);
      return false;
    }
    const before = progress(c);
    const store = useChallenges.getState();
    track('core_action_started', { kind: c.kind });
    const d = store.deposit(c.id, amount, slot);
    const after = useChallenges.getState().challenges.find((x) => x.id === c.id)!;
    track('core_action_completed', { kind: c.kind, slot: slot ?? null });

    if (isComplete(after) && !after.completedOn) {
      store.markComplete(c.id, todayKey());
      track('milestone_reached', { kind: c.kind, milestone: 'complete' });
      celebrate({ scene: 'challenge-complete', emoji: '🚩', title: 'Challenge complete!', body: `The flag goes on top of the stack. ${c.name}: done.` });
      return true;
    }
    const crossed = MILESTONES.find((m) => before < m && progress(after) >= m);
    if (crossed) {
      track('milestone_reached', { kind: c.kind, milestone: crossed });
      celebrate({ scene: 'milestone', emoji: '🪙', title: `${Math.round(crossed * 100)}% stacked`, body: 'Coins clink onto the stack. Keep going.' });
    }
    const what = slot != null ? `${slotLabel(c, slot)}: ` : '';
    toast(amount > 0 ? `${what}${formatGBP(amount, { whole: true })} stacked.` : `${what}kept spend-free.`, {
      actionLabel: 'Undo',
      onAction: () => useChallenges.getState().undo(c.id, d.id),
    });
    return true;
  };
}
