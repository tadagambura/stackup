import { Text } from 'react-native';
import { Intro } from '@/kit/Intro';
import { useTheme } from '@/kit/theme';
import { CoinStack } from './Coins';

export function StackUpIntro({ onDone }: { onDone: () => void }) {
  const { c, font } = useTheme();
  return (
    <Intro
      cta="Start stacking"
      onDone={onDone}
      steps={[
        {
          title: 'Stack it up',
          body: 'Pick a savings challenge and stack money in one tap. Small amounts, real progress.',
          art: <CoinStack progress={0.6} size={160} />,
        },
        {
          title: 'Safe to spend',
          body: "Tell StackUp your payday and bills and it shows what's safe to spend each day. No bank login: your numbers stay on your phone.",
          art: <Text style={{ fontFamily: font.display, fontSize: 56, color: c.primary }}>£23/day</Text>,
        },
        {
          title: 'One minute a day',
          body: 'A 60-second money lesson with a quick quiz. Every fact shows where it came from.',
          art: <Text style={{ fontSize: 96 }}>🧠</Text>,
        },
      ]}
    />
  );
}
