# Similar-product review

Reviewed: 2026-08-16.

## Products reviewed

| Product | Notable behavior | Eye Gym status |
|---|---|---|
| [Happy Eyes](https://happyeyesapp.com/) | 20–20–20 timer, optional longer breaks and configurable cadence | Configurable 20–20–20 timer added |
| [Eye Rest Reminder](https://eyerestreminder.com/) | Background-tab countdown, audio/visual notification, refresh persistence | Absolute-deadline persistence and system notification added |
| [BreakSignal](https://www.break-signal.com/) | Presets, snooze, daily break counts, compact local-first workflow | Snooze and daily completed-break count added |
| [EyeBreak](https://eyebreak.app/) | Pre-break warnings, idle pause, themes, full-screen break overlay | Full-screen calm break overlay added; idle detection remains a desktop-native opportunity |
| [Blinker](https://www.getblinker.app/) | Blink nudges, short/long breaks, DND and strict modes | Blink guidance included in the break and workspace checklist; enforcement intentionally omitted |
| [DOOVI](https://doovi.mcrudra.com/) | Automated 20-minute cycle and 20-second distance prompt | Equivalent web/PWA cycle added without claiming treatment or protection |

## Evidence and product boundaries

Eye Gym presents the timer as a screen-break habit, not treatment. The [AAO-reviewed EyeWiki article on digital eye strain](https://eyewiki.aao.org/Computer_Vision_Syndrome_(Digital_Eye_Strain)) describes regular breaks, frequent blinking, the 20–20–20 pattern, glare reduction and a screen position slightly below eye level. It also notes that special blue-light eyewear is not recommended as a remedy for computer use. Eye Gym therefore avoids blue-light-filter claims and does not promise to prevent myopia or cure eye conditions.

## Implemented from this review

- Persistent work/break timer with 15/20/30/45/60-minute work intervals and 20/30/60-second breaks.
- Absolute timestamps instead of decrement-only state, so refreshes and throttled background tabs do not silently reset the deadline.
- Full-screen distance-look break, visible countdown, completion and five-minute snooze.
- Optional browser notifications requested only from an explicit user action.
- Daily completed-break count stored locally.
- Compact evidence-based workspace checklist covering distance, height, glare, blinking and short breaks.
- RU/RO/EN interface and accessible controls consistent with the existing application.

## Deliberately not copied

- Camera-based blink or distance detection: unnecessary privacy and permission cost for the current product.
- Forced/strict breaks: conflicts with accessibility and user control.
- Medical scores or claims that exercises improve vision or slow myopia: outside the informational scope and not supported for this implementation.
- Generic hydration, posture and productivity suites: useful in broader wellness products, but outside Eye Gym’s focused purpose.
