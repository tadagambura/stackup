# StackUp: Spec

**Save money and learn money, one minute a day** · #1 of 16 · Wave 1: Daily keepers · Used: Daily · Very easy · Revenue potential: Medium–high · Money & Work · Source: ChatGPT + Perplexity (merges StackUp)

## One-liner

Pick a savings challenge (52-week, £5-a-day, £1,000 in 90 days, 100 envelopes, no-spend weekends), log what you put away and watch the stack grow. Every day there's also a one-minute money lesson or quiz (budgeting, saving, credit, pensions, tax, scams) with XP and levels, inspired by the ideas in Morgan Housel's The Psychology of Money and checked against trusted UK sources. Learn something, then do something: each lesson ends with an action in your challenge. No bank connection; you log deposits yourself.

## Problem / audience

- **Who it's for:** Young adults who are saving for something and feel behind on money basics.
- **The problem it solves:** Saving feels abstract and slow, and money advice is long and overwhelming. Paper trackers get lost and nobody explains the 'why'.
- **Example:** A user starts '£1,000 in 90 days', does the morning lesson on emergency funds (+10 XP), logs £20, keeps a 40-day streak with one freeze, and shares a card when they pass £500.

## MVP features (ship with only these)

1. Prebuilt challenges: 52-week, £5-a-day, save £500/£1,000/£5,000, £1,000 in 90 days, 100 envelopes, no-spend weekends
2. Log a deposit in one tap; the progress bar and stack fill up
3. One 60-second lesson or quiz a day, with XP, levels and a streak (earned freezes)
4. Units: money mindset (inspired by The Psychology of Money), budgeting, saving, credit, pensions, tax, scams; every lesson shows its source and when it was checked
5. Milestone and completion cards to share

## Not in MVP

- Multiple active goals
- Premium deep-dive lesson units
- Life-event packs (first job, moving out)
- Partner challenge (save together)
- Seasonal challenges (Christmas fund, summer holiday)

## Monetisation

| Model | Detail |
|---|---|
| Free | One active challenge and the daily lesson, with ads |
| Premium | £2.99/month, £14.99/year or £6.99 lifetime: unlimited goals, every lesson unit, custom challenges, themes, no ads |
| Ads | Banner only, never on the deposit or lesson screens |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Daily lesson reminder, payday, and a weekly 'stack day' |
| Tiny win | Finish a 60-second lesson or log a deposit in one tap |
| Progress | Stack and progress bar, XP and levels, streak, milestones |
| Share | Milestone, level-up and completion cards |
| Next step | Next lesson unlocks; on completion, the next challenge is offered straight away |
| Cadence | Daily |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Playful.** Celebrations, confetti, cute characters, satisfying sounds and mild comic reactions. Nothing tragic.

- Deposit: a coin drops onto the stack with a clink and the stickman fist-pumps
- Lesson right: the coin mascot does a backflip and '+10 XP' floats up (wrong: a kind 'ooh, close!')
- Every £100: the stack wobbles, topples into a confetti pile, and the stickman dives in
- Streak freeze used: the stickman wraps the stack in a scarf and hands it a hot chocolate
- Challenge complete: the tower grows and the stickman throws a flag onto the top

**Line we don't cross:** No drama about withdrawing or missing a deposit.

## AI

**None for facts.** Lessons are written and checked by people from trusted sources (GOV.UK, MoneyHelper, HMRC, FCA). AI may help draft, but never publishes a fact unreviewed. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app (iOS, Android, web).
- **Data:** On the device only. No bank connection.
- **Backend:** None for the free version: everything lives on the phone. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Practical saving tips; Savings challenges; Money myths vs facts; Money psychology; UK money rules explained
- **Shareable output:** Milestone, level-up and completion cards

## Risks

Lessons must be accurate, sourced, reviewed by a person and re-checked every April; AI can help draft but never publishes unreviewed. The Psychology of Money is used for its ideas, credited, never copied. Education and tracking, not personal advice: FCA financial-promotion rules mean no product recommendations. Users can leave after finishing a challenge, so the next challenge and the daily lesson must always be ready.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config
