# StackUp: Spec

**Know what's safe to spend, then stack the rest** · #1 of 15 · Wave 1: Daily keepers · Used: Daily · Very easy · Revenue potential: Medium–high · Money & Work · Source: ChatGPT + Perplexity (absorbs PocketLeft, Payday, MoneyMinute and SubSpot)

## One-liner

Two questions, one money app. First: what can I safely spend before payday? Set your pay schedule and bills, and StackUp shows safe-to-spend for today, this week and until payday, with an 'can I afford £X?' check and every subscription and renewal in one place. Second: how do I actually save? Pick a challenge (52-week, £5-a-day, 100 envelopes, £1,000 in 90 days, no-spend weekends) and stack money in one tap; anything left before payday can be stacked too. Every day there's also a one-minute money lesson or quiz with XP and levels. No bank linking: your numbers stay on your phone.

## Problem / audience

- **Who it's for:** UK young adults and anyone living payday to payday who wants to stop running out of money and finally save something, without handing an app their bank login.
- **The problem it solves:** Money runs out before payday, subscriptions sneak up, and saving feels impossible or boring.
- **Example:** A user starts '£1,000 in 90 days', does the morning lesson on emergency funds (+10 XP), logs £20, keeps a 40-day streak with one freeze, and shares a card when they pass £500.

## MVP features (ship with only these)

1. Pay schedule (weekly, fortnightly, four-weekly, monthly or irregular), bills and safe-to-spend for today, this week and until payday
2. 'Can I afford £X?' check and payday countdown
3. Subscriptions and renewals: monthly total, trial-ending and renewal reminders
4. Savings challenges: 52-week, £5-a-day, 100 envelopes, £1, 000 in 90 days, no-spend weekends; one-tap deposits; stack your leftover before payday
5. One 60-second money lesson or quiz a day with XP, levels and a forgiving streak; every lesson shows its source and when it was checked

## Not in MVP

- Forecasts and multiple incomes
- Home-screen widgets for safe-to-spend
- Custom challenges and themes
- Shareable milestone cards
- Monthly money snapshot

## Monetisation

| Model | Detail |
|---|---|
| Free | Safe-to-spend, one active challenge and the daily lesson, with ads |
| Premium | £2.99/month, £19.99/year or a one-off lifetime price: unlimited challenges, recurring bills, subscriptions, forecasts, widgets, every lesson unit, no ads |
| Ads | Banner only, never on the safe-to-spend number, deposits or lessons |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Morning safe-to-spend glance and the daily lesson |
| Tiny win | Stay under today's number, log a deposit or answer the quiz |
| Progress | Days to payday, the savings stack, XP and levels |
| Share | Milestone and challenge-complete cards |
| Next step | Next payday, next milestone, next lesson |
| Cadence | Daily |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Playful.** Celebrations, confetti, cute characters, satisfying sounds and mild comic reactions. Nothing tragic.

- Deposit: coins clink onto the stack
- Safe-to-spend hits £0: he empties his pockets, a fly buzzes out, he scratches his head
- Daily lesson: right answer = backflip
- Payday: confetti and a happy dance
- Challenge complete: the flag goes on top of the stack

**Line we don't cross:** Never shame spending; money warnings stay calm and kind.

## AI

**None for facts.** Lessons are written and checked by people from trusted sources (GOV.UK, MoneyHelper, HMRC, FCA). AI may help draft, but never publishes a fact unreviewed. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app (iOS, Android, web).
- **Data:** On the device only. No bank connection.
- **Backend:** None for the free version: everything lives on the phone. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Practical saving tips; Savings challenges; Money myths vs facts; Money psychology; UK money rules explained; Payday-to-payday budgeting
- **Shareable output:** Milestone and challenge-complete cards

## Risks

Lessons must stay general education, never personal financial advice (FCA financial promotions): sources shown and reviewed. Safe-to-spend is only as good as what people enter, so the app says so plainly. Bigger scope than a simple tracker: ship challenges and lessons first, safe-to-spend in the next update.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config
