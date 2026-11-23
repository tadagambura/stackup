// StackUp's signature visual: a stack of coins that grows with progress.
import { View } from 'react-native';
import { useTheme } from '@/kit/theme';

export function CoinStack({ progress, size = 120, flag }: { progress: number; size?: number; flag?: boolean }) {
  const { c } = useTheme();
  const coins = Math.max(1, Math.round(Math.min(1, progress) * 10));
  const w = size * 0.7;
  const h = size * 0.09;
  return (
    <View style={{ width: size, height: size * 1.05, alignItems: 'center', justifyContent: 'flex-end' }} accessible accessibilityLabel={`Savings stack, ${Math.round(progress * 100)} percent`}>
      {flag ? (
        <View style={{ alignItems: 'flex-start', marginBottom: 2, width: w * 0.5 }}>
          <View style={{ width: w * 0.28, height: w * 0.18, backgroundColor: c.danger, borderTopRightRadius: 4, borderBottomRightRadius: 4, marginLeft: 3 }} />
          <View style={{ width: 3, height: w * 0.35, backgroundColor: c.text }} />
        </View>
      ) : null}
      {Array.from({ length: coins }).map((_, i) => (
        <View
          key={i}
          style={{
            width: w,
            height: h,
            marginTop: i === 0 ? 0 : -h * 0.35,
            borderRadius: h,
            backgroundColor: c.accent,
            borderWidth: 2,
            borderColor: c.text,
            transform: [{ translateX: ((i * 37) % 7) - 3 }],
          }}
        />
      ))}
      <View style={{ width: w * 1.15, height: 3, backgroundColor: c.text, borderRadius: 2, marginTop: 2 }} />
    </View>
  );
}
