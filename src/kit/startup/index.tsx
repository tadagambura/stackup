// The Kaotic Chainz start-up animation: two chain links fly in, clink together and settle into
// the name as its "cC". Shown once per launch, over the app. Tap to skip. With reduced motion
// on, the finished name is shown briefly instead.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, Pressable, StyleSheet, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { BACKGROUND, LETTERS } from './layout';
import { DURATION, frameAt, sampleTimes, stageFor } from './timeline';

const LINKS = {
  red: { flying: require('./link-red.png'), joined: require('./link-red-joined.png') },
  lime: { flying: require('./link-lime.png'), joined: require('./link-lime-joined.png') },
};
const SPARK_COLOURS = ['#ff4d2e', '#c6f432', '#ffffff'];
const NATIVE = Platform.OS !== 'web';
const FADE_MS = 250;
const REDUCED_HOLD_MS = 700;
/** Never keep someone out of the app, whatever happens to the animation. */
const LIMIT_MS = 5000;

function Picture({ source, opacity }: { source: ImageSourcePropType; opacity?: Animated.AnimatedInterpolation<number> }) {
  return <Animated.Image source={source} fadeDuration={0} resizeMode="stretch" style={[styles.fill, opacity ? { opacity } : null]} />;
}

export function KCStartup({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const [time] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const leaving = useRef(false);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  const leave = useMemo(
    () => () => {
      if (leaving.current) return;
      leaving.current = true;
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: NATIVE }).start(() => done.current());
    },
    [fade],
  );

  useEffect(() => {
    let cancelled = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const limit = setTimeout(() => done.current(), LIMIT_MS);
    const play = (reduced: boolean) => {
      if (cancelled) return;
      if (reduced) {
        time.setValue(DURATION);
        hold = setTimeout(leave, REDUCED_HOLD_MS);
        return;
      }
      Animated.timing(time, { toValue: DURATION, duration: DURATION * 1000, easing: Easing.linear, useNativeDriver: NATIVE }).start(({ finished }) => {
        if (finished) leave();
      });
    };
    AccessibilityInfo.isReduceMotionEnabled().then(play, () => play(false));
    return () => {
      cancelled = true;
      clearTimeout(limit);
      clearTimeout(hold);
      time.stopAnimation();
    };
  }, [time, leave]);

  const stage = stageFor(width, height);
  const times = sampleTimes();
  const frames = times.map((t) => frameAt(t, stage));
  const track = (pick: (f: (typeof frames)[number]) => number) => time.interpolate({ inputRange: times, outputRange: frames.map(pick) });
  const turn = (pick: (f: (typeof frames)[number]) => number) => time.interpolate({ inputRange: times, outputRange: frames.map((f) => `${pick(f)}rad`) });
  const scale = stage.word / 1000;
  const box = { w: 36 * stage.hero, h: 30 * stage.hero };

  return (
    <Animated.View testID="kc-startup" style={[StyleSheet.absoluteFill, styles.screen, { opacity: fade }]}>
      <StatusBar style="light" />
      <Pressable style={styles.fill} onPress={leave} accessibilityRole="button" accessibilityLabel="Kaotic Chainz. Skip intro">
        {LETTERS.map((l, i) => (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: width / 2 + l.x * scale, top: height / 2 + l.y * scale, width: l.w * scale, height: l.h * scale, opacity: track((f) => f.letters[i].opacity), transform: [{ translateX: track((f) => f.letters[i].dx) }] }}
          >
            <Picture source={l.source} />
          </Animated.View>
        ))}
        {(['lime', 'red'] as const).map((colour) => (
          <Animated.View
            key={colour}
            style={{ position: 'absolute', left: (width - box.w) / 2, top: (height - box.h) / 2, width: box.w, height: box.h, transform: [{ translateX: track((f) => f[colour].x) }, { rotate: turn((f) => f[colour].rotate) }, { scale: track((f) => f[colour].scale) }] }}
          >
            {/* Uncut while flying; the over-and-under cut appears as they meet. */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: track((f) => (f.joined ? 0 : 1)) }]}>
              <Picture source={LINKS[colour].flying} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: track((f) => (f.joined ? 1 : 0)) }]}>
              <Picture source={LINKS[colour].joined} />
            </Animated.View>
          </Animated.View>
        ))}
        {frames[0].sparks.map((_, i) => {
          const length = stage.hero * 7;
          const thick = Math.max(2, width * 0.009);
          return (
            <Animated.View
              key={`spark-${i}`}
              style={{
                position: 'absolute', left: (width - length) / 2, top: (height - thick) / 2, width: length, height: thick, borderRadius: thick / 2, backgroundColor: SPARK_COLOURS[i % 3],
                opacity: track((f) => f.sparks[i].opacity),
                transform: [{ translateX: track((f) => f.sparks[i].x) }, { translateY: track((f) => f.sparks[i].y) }, { rotate: `${frames[0].sparks[i].angle}rad` }, { scale: track((f) => f.sparks[i].scale) }],
              }}
            />
          );
        })}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: BACKGROUND, zIndex: 1000, elevation: 1000 },
  fill: { width: '100%', height: '100%' },
});
