# StackUp: Spec

**Savings challenges you actually finish** · #1 of 33 in the build order · Very easy · Revenue potential: Medium–high · Money & Work · Source: ChatGPT + Perplexity

## One-liner

Pick a savings challenge (52-week, £5-a-day, £1,000 in 90 days, 100 envelopes, no-spend weekends), log what you put away, and watch the stack grow. No bank connection: you log deposits yourself, so it stays private and simple.

## Problem / audience

- **Who it's for:** Young adults and anyone saving for a holiday, emergency fund, house deposit or a specific purchase.
- **The problem it solves:** Saving feels abstract and slow. Paper trackers get lost and there's no sense of momentum.
- **Example:** A user starts '£1,000 in 90 days', logs £20 here and £15 there, keeps their weekly streak alive with one freeze, and shares a card when they pass £500.

## MVP features (ship with only these)

1. Prebuilt challenges: 52-week, £5-a-day, save £500/£1,000/£5,000, £1,000 in 90 days, 100 envelopes, no-spend weekends
2. Log a deposit in one tap; the progress bar and stack fill up
3. Weekly streak with earned freezes, plus milestones (first £100, halfway, done)
4. Custom challenge (target and deadline) with a suggested weekly amount
5. Shareable milestone and completion cards

## Not in MVP

- Multiple active goals
- Premium themes and visuals
- Partner challenge (save together)
- Seasonal challenges (Christmas fund, summer holiday)

## Monetisation

| Model | Detail |
|---|---|
| Free | One active challenge, with ads |
| Premium | £2.99/month, £14.99/year or £6.99 lifetime: unlimited goals, custom challenges, themes |
| Ads | Banner only, never on the deposit screen |

Prices are starting points; test before committing.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Payday, plus a weekly 'stack day' the user picks |
| Tiny win | Log a deposit in one tap |
| Progress | Progress bar, weekly streak, milestones |
| Share | Milestone and completion cards |
| Next step | On completion, immediately offer the next challenge (bigger, or seasonal) |
| Cadence | Weekly + payday |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Platform & data

- **Platform:** Expo app (iOS, Android, web).
- **Data:** On the device only. No bank connection.
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Practical saving tips; Savings challenges; Money psychology; Relatable money moments; Progress and motivation
- **Shareable output:** Milestone and completion cards

## Risks

Users leave after finishing a challenge unless the next one is offered straight away. It's a tracker, not financial advice, and the wording must stay that way.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to growth-engine as an app config
