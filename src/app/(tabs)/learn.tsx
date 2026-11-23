import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { formatDay, todayKey } from '@/kit/dates';
import { computeStreak, streakMessage } from '@/kit/streak';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, Chip, H1, H2, Label, Muted, Note, ProgressBar, Row, Screen, Section, Stack, Strong } from '@/kit/ui';
import { lessonForDay, levelFor } from '@/domain/lessons';
import { pack } from '@/content/lessons';
import { CardLibrary, FREE_CARDS, type CardPack } from '@/kit/cards';
import { usePremium } from '@/kit/premium';
import { useLearn } from '@/state/stores';

export default function Learn() {
  const { c, radius } = useTheme();
  const learn = useLearn();
  const celebrate = useCelebrate();
  const today = todayKey();
  useEffect(() => {
    learn.ensureStarted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { isPremium } = usePremium();
  const daily = isPremium ? pack : { ...pack, lessons: pack.lessons.slice(0, FREE_CARDS) };
  const lesson = lessonForDay(daily, learn.firstDay ?? today, today);
  const library: CardPack = { pack: pack.pack, version: pack.version, checked: pack.checked, reviewed: pack.reviewed, cards: pack.lessons };
  const answered = learn.answers[today];
  const [picked, setPicked] = useState<number | null>(null);
  const lvl = levelFor(learn.xp);
  const streak = computeStreak({ done: Object.keys(learn.answers), start: learn.firstDay ?? today, today });
  const chosen = answered ? (answered.correct ? lesson.quiz.answer : picked) : picked;

  const answer = (i: number) => {
    if (answered) return;
    setPicked(i);
    const correct = i === lesson.quiz.answer;
    const gained = learn.answer(today, lesson.id, correct);
    track('value_delivered', { what: 'lesson', correct });
    if (correct) celebrate({ scene: 'lesson-right', emoji: '🤸', title: 'Backflip!', body: `Right answer. +${gained} XP` });
  };

  const history = Object.entries(learn.answers)
    .filter(([d]) => d !== today)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 10);

  return (
    <Screen testID="learn">
      <H1>Learn</H1>
      <Card tone="alt">
        <Row style={{ justifyContent: 'space-between' }}>
          <Strong testID="learn-level">{`Level ${lvl.level}`}</Strong>
          <Muted testID="learn-xp">{`${learn.xp} XP`}</Muted>
        </Row>
        <ProgressBar value={lvl.into / lvl.span} label={`Level ${lvl.level} progress`} />
        <Muted>{streakMessage(streak, 'day')}</Muted>
      </Card>

      <Card testID="lesson">
        <Row style={{ justifyContent: 'space-between' }}>
          <Chip label={lesson.topic} />
          <Muted>{formatDay(today)}</Muted>
        </Row>
        <H2>{lesson.title}</H2>
        <Body>{lesson.body}</Body>
        <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(lesson.source.url)}>
          <Muted color={c.primary}>{`Source: ${lesson.source.name} · checked ${formatDay(pack.checked)} ↗`}</Muted>
        </Pressable>
      </Card>

      <Section title="Quick quiz">
        <Strong>{lesson.quiz.q}</Strong>
        <Stack gap={8}>
          {lesson.quiz.options.map((o, i) => {
            const isRight = i === lesson.quiz.answer;
            const show = answered != null || picked != null;
            const bg = show && isRight ? c.success : show && chosen === i && !isRight ? c.surfaceAlt : c.surface;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ disabled: show, selected: chosen === i }}
                accessibilityLabel={`${o}${show && isRight ? ', correct answer' : ''}`}
                disabled={show}
                onPress={() => answer(i)}
                testID={`quiz-${i}`}
                style={{ padding: 14, minHeight: 52, borderRadius: radius, borderWidth: 1.5, borderColor: show && isRight ? c.success : c.border, backgroundColor: bg }}
              >
                <Text style={{ color: show && isRight ? '#fff' : c.text, fontSize: 16, fontWeight: '600' }}>{o}</Text>
              </Pressable>
            );
          })}
        </Stack>
        {answered || picked != null ? (
          <Note>
            {`${(answered?.correct ?? picked === lesson.quiz.answer) ? 'Correct. ' : 'Not quite. '}${lesson.quiz.explain}`}
          </Note>
        ) : null}
        {answered ? <Muted testID="lesson-done">{"That's today's lesson done. The next one unlocks tomorrow."}</Muted> : null}
      </Section>

      {history.length ? (
        <Section title="Earlier lessons">
          {history.map(([day, a]) => {
            const l = pack.lessons.find((x) => x.id === a.lessonId);
            return (
              <Row key={day} style={{ justifyContent: 'space-between' }}>
                <Body numberOfLines={1} style={{ flex: 1 }}>
                  {l?.title ?? a.lessonId}
                </Body>
                <Muted>{a.correct ? '✓' : '·'}</Muted>
              </Row>
            );
          })}
        </Section>
      ) : null}

      <Section title="All money lessons">
        <CardLibrary pack={library} app="stackup" />
      </Section>

      <Label>General information, not financial advice</Label>
      <Muted>{"Lessons explain how money things work in the UK. They can't tell you what's right for you. For free, impartial help, try MoneyHelper."}</Muted>
      <Button title="Open MoneyHelper" variant="ghost" onPress={() => WebBrowser.openBrowserAsync('https://www.moneyhelper.org.uk/')} />
    </Screen>
  );
}
