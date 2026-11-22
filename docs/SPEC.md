# StackUp: Spec

**Rank in portfolio:** #4 of 15 (easiest → hardest) · **Difficulty:** Very easy

## One-liner

Savings challenges you can actually finish: 52-week, £5-a-day, save £1,000 and more.

## Problem / audience

- **Who it's for:** Young adults trying to build a savings habit.
- **The problem it solves:** Saving feels abstract. Challenges make it concrete, but paper trackers get lost.

## MVP features (ship with only these)

1. Pick a challenge: 52-week, £5-a-day, save £500/£1,000/£5,000, 100 envelopes
2. Log deposits, see progress fill up
3. Streaks and milestones
4. Custom challenge (amount + deadline)
5. Progress share card

## Not in MVP

- Premium goals and multiple active challenges
- Visual themes
- Shared challenge with a partner

## Monetisation

| Model | Detail |
|---|---|
| Free | 1 active challenge, with ads |
| Paid | £2.99/month or £14.99/year: unlimited challenges, custom goals, themes |
| Ads | Banner, never during deposit logging |

Prices are starting points from the portfolio brief; test before committing.

## Platform & stack

- **Platform:** Expo (web + iOS + Android).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob). See the portfolio roadmap.
- **Data:** Device only. No bank connection: users log deposits themselves.

## Growth engine hooks

- **Shareable output:** Progress cards ("£640 of £1,000 saved").
- **Content pillars:** Practical saving tips; Savings challenges; Money psychology; Relatable money moments; Progress & motivation

## Notes

**Pilot app for the growth engine.** Huge search demand for savings-challenge printables and trackers. First place to use the shared retention module (streaks, milestones). Must not give financial advice; it's a tracker.

## Launch checklist

- [ ] Name checked on App Store / Play Store / trademark search
- [ ] MVP features done and tested
- [ ] Privacy policy + terms
- [ ] Landing page
- [ ] Analytics wired
- [ ] Payments / ads wired
- [ ] Added to growth-engine as an app config
