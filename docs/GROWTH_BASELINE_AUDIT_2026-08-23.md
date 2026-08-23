# Eye Gym — Growth Baseline Audit

Date: 2026-08-23
Scope: readiness for distribution, measurement, reliability and discoverability. Product redesign is intentionally out of scope because the current experience is already strong enough to distribute.

## Executive summary

Eye Gym is much closer to distribution-ready than a typical early project. The core product already has PWA installation, offline behavior, RU/RO/EN localization, workout history, reminders, Web Push, Telegram delivery, gamification, privacy consent, medical boundaries, CI, health checks, backups and deployment verification.

The largest growth risk is **not the product itself**. It is that we currently cannot measure the full acquisition → activation → retention funnel accurately enough to know which distribution channel works.

The second risk is discoverability. Technical SEO foundations exist and a generator already creates multilingual intent pages, but search visibility is still weak and should be verified in Google Search Console rather than assumed from the repository.

The third risk is attribution and referral readiness. UTM parsing exists in code, but core events currently use `track(...)`, not `trackWithAttribution(...)`, so campaign source/campaign data is not reliably attached to the actions that matter.

### Overall readiness

- Core product: **GREEN**
- PWA/offline: **GREEN**
- Deployment/health checks: **GREEN**
- Privacy/medical positioning: **GREEN**
- SEO technical foundation: **GREEN / needs production verification**
- Acquisition attribution: **YELLOW**
- Funnel analytics: **YELLOW**
- Retention analytics: **YELLOW**
- Referral/share loop: **YELLOW/RED**
- External search visibility: **YELLOW**
- Paid-acquisition readiness: **RED — deliberately not yet**

## 1. Product readiness

### What is already strong

The current implementation includes:

- six workout complexes and sixteen exercises;
- browser/PWA/Telegram Mini App support;
- local/offline history and synchronization;
- RU/RO/EN UI and content;
- configurable 20–20–20 break timer;
- browser/Web Push/Telegram reminder infrastructure;
- progress, statistics, child-safe stars/levels/badges;
- educational material with evidence links;
- explicit medical disclaimer;
- Google/Telegram identity support;
- accessible themes, reduced motion and high-contrast support;
- PWA install prompt, iOS guidance and update handling.

Conclusion: **do not spend the next growth cycle redesigning the core UI.** Changes should be limited to items that measurably improve acquisition, activation, retention or sharing.

## 2. Reliability and deployment

### Status: GREEN

CI runs TypeScript checks, tests and production builds for frontend and backend and validates Docker Compose. Production deployment builds the frontend, deploys API/worker/database, runs migrations, checks the local API, configures Caddy, then verifies the public API and sitemap.

The deployment workflow also contains health checks and rollback-oriented safeguards for reverse-proxy configuration.

### Remaining verification

The existing implementation-status document still lists some production acceptance inputs as externally dependent. Before a larger launch, confirm in production:

- Google auth if it is intended to be offered publicly;
- Telegram bot/Mini App configuration if promoted;
- Web Push end-to-end delivery;
- backup restore drill;
- GA4 Measurement ID is actually supplied to the frontend build.

These are launch checks, not blockers for continuing organic distribution work.

## 3. Analytics baseline

### What exists

There is a privacy-conscious GA4 integration:

- analytics is opt-in;
- GA is disabled until consent is granted;
- IP anonymization is requested;
- Google Signals and ad-personalization signals are disabled;
- UTM source/medium/campaign/content/term parsing exists;
- first-touch attribution is stored locally.

Existing tracked events include at least:

- `app_opened`;
- `signed_in`;
- `language_changed`;
- `voice_changed`;
- `reminder_permission`;
- `workout_started`;
- `workout_completed`;
- `workout_exited`;
- `pwa_installed`.

### Critical gap

The application imports and uses `track(...)` for its core product events. The attribution helper `trackWithAttribution(...)` exists but is not used on the important activation events inspected during this audit.

This means a link such as:

`?utm_source=reddit&utm_medium=community&utm_campaign=developer_launch`

can be captured locally, but the eventual `workout_completed` event may not contain those acquisition dimensions.

### Missing/insufficient funnel events

For growth decisions we additionally need explicit measurement for:

- landing/session source;
- first useful action;
- break timer start;
- break completion;
- notification permission result for the local 20–20–20 timer;
- install prompt shown/dismissed/accepted;
- learn/SEO page → app transition;
- share button shown/clicked/success;
- return-day classification;
- first workout vs repeat workout;
- game entry/completion/core-product conversion when games are introduced.

### Priority

**P0 before active promotion:** complete attribution and funnel event instrumentation.

## 4. Retention measurement

### Product mechanisms: GREEN

Eye Gym already has substantial retention mechanics:

- history;
- stats;
- streaks;
- stars/levels/badges;
- daily mission;
- reminders;
- Web Push;
- PWA;
- account sync;
- break timer.

### Measurement: YELLOW

The product can retain users, but the analytics layer currently does not clearly expose:

- D1 retention;
- D7 retention;
- D30 retention;
- weekly active users completing a useful action;
- sessions per active user;
- reminder-enabled vs reminder-disabled retention;
- PWA vs browser retention;
- acquisition-source retention.

This should be solved mostly in analytics/reporting, not by adding more product features.

## 5. SEO baseline

### Technical foundation: strong

The root page already has:

- index/follow;
- canonical URL;
- title and description;
- Open Graph metadata;
- Twitter card;
- 1200×630 social image;
- WebApplication structured data;
- multilingual application metadata.

`robots.txt` allows crawling and points to the sitemap.

There is also a build-time SEO generator that creates RU/EN/RO intent pages for topics such as:

- 20-20-20 rule;
- computer eye strain habits;
- eye breaks at work;
- programmers;
- gamers;
- students;
- children/parents;
- office workers.

It also creates hreflang links and sends users back into the app through UTM-tagged CTAs.

### Important observation

A generic web search performed during this audit did **not** surface `eye-gym.bacus.dev`; instead it strongly surfaced the unrelated commercial `eyegym.com` brand.

This does not prove Google has not indexed Eye Gym, but it does prove that we should not infer real search visibility merely because sitemap/SEO files exist.

### P0/P1 SEO checks

Verify in Google Search Console:

1. property ownership;
2. submitted sitemap;
3. number of discovered/indexed pages;
4. crawl/indexing errors;
5. queries receiving impressions;
6. canonical selection;
7. multilingual page indexing;
8. Core Web Vitals report.

Then prioritize pages already receiving impressions rather than creating dozens more pages blindly.

## 6. Brand/search collision

There is an established product at `eyegym.com` using the name EyeGym and operating in visual/cognitive training.

This creates two distribution issues:

1. branded search competition for “Eye Gym / EyeGym”;
2. possible user confusion about whether the products are related.

This does **not** mean the current project must be renamed immediately. It means distribution should rely heavily on descriptive intent such as:

- screen break timer;
- 20-20-20 timer;
- eye breaks for developers;
- screen break app;
- eye rest reminder;

rather than expecting the brand name alone to acquire search traffic.

Before commercial scaling, a separate trademark/name-risk check is recommended.

## 7. Landing/activation baseline

The dashboard already contains a prominent Quick Start block and does not require signup before using the core product. This is excellent for acquisition traffic.

The current primary activation definition should be:

**Visitor completes one workout OR completes one screen-break cycle.**

We should avoid defining signup as activation because account creation is not necessary to obtain value.

### Recommended first funnel

`landing → app opened → workout/timer started → useful action completed → return within 7 days`

A later funnel can include PWA installation and reminder opt-in as retention accelerators rather than mandatory activation steps.

## 8. PWA baseline

### Status: GREEN

The repository contains PWA icons, app shell/offline support, install prompt logic, iOS guidance and install tracking.

Do not rebuild the PWA before distribution. Instead measure:

- install prompt eligibility;
- prompt display;
- prompt acceptance;
- installed-user retention vs browser-user retention.

## 9. Privacy and health-positioning baseline

### Status: GREEN

The product is correctly positioned as a wellness/screen-break tool rather than a medical treatment. Existing competitor review explicitly avoids claims around curing eye conditions, preventing myopia or guaranteeing vision improvement.

Analytics consent is explicit and GA does not load before consent.

This boundary must be preserved in ads, Reddit posts, SEO titles, social videos and creator outreach. Distribution copy is more likely to create regulatory/reputation problems than the current product code.

## 10. Share/referral baseline

### Status: weak compared with the rest of the product

The inspected core experience has strong completion rewards but no obvious growth loop around them.

Best opportunity:

After workout completion or a milestone, offer an optional share action such as:

- “I took a 5-minute screen break”;
- weekly screen-break summary;
- unlocked explorer level/badge;
- later, game challenge result.

Shared assets must not expose private health/account data.

Every shared link should contain a referral/campaign identifier so we can measure:

`share → visit → activation → retention`.

## 11. Distribution channel readiness

### Ready now, after analytics P0

Best initial channels:

1. developer communities;
2. Reddit communities where useful self-promotion is allowed;
3. Romanian/Moldovan communities;
4. Russian-speaking productivity/developer communities;
5. short-form video demonstrations;
6. SEO pages already generated;
7. Product Hunt/Indie Hackers once launch materials are ready.

### Why developers first

The positioning is unusually natural:

- hours at a monitor;
- easy 20–20–20 explanation;
- browser/PWA installation;
- no hardware required;
- immediate free use;
- easy to demonstrate in a 20–30 second video/post.

## 12. Games

Games are promising as an acquisition layer but should not delay the initial distribution launch.

Recommended order:

1. instrument Eye Gym correctly;
2. start distribution of the existing product;
3. learn which audience responds;
4. build one small game specifically for that audience;
5. measure `game → Eye Gym activation`.

The first game should be tiny and shareable, not a second large project.

## 13. P0 backlog — before real promotion

### P0.1 Attribution

Use acquisition attribution on activation/completion events so campaigns can be compared.

### P0.2 Timer analytics

Track timer start, break shown, break completed, snoozed/reset and notification result.

### P0.3 Install funnel

Track install prompt shown, accepted and dismissed, not only final successful install.

### P0.4 Weekly growth dashboard

Create one GA4 exploration/report containing:

- users;
- source/medium/campaign;
- activation rate;
- workout completion;
- timer completion;
- D1/D7 returning users;
- PWA installs;
- reminder opt-in;
- useful actions per active user.

### P0.5 Search Console verification

Verify real indexing and sitemap state.

### P0.6 Production smoke checklist

Before any large public post, verify:

- home page;
- one workout end-to-end;
- timer end-to-end;
- PWA install path;
- notification path;
- API health;
- sitemap;
- privacy/terms/about;
- mobile layout;
- public version currently deployed.

## 14. P1 backlog — first distribution cycle

- Add optional share action after positive completion moments.
- Create canonical UTM naming convention.
- Prepare screenshots/GIF/video demo pack.
- Prepare three audience-specific landing URLs/messages: developers, office workers, parents.
- Submit/verify all generated SEO URLs through sitemap/Search Console.
- Launch 3–5 small community/content experiments rather than one large campaign.
- Record every experiment in a growth log.

## 15. Decision

**Eye Gym is ready to move from “product development” into “distribution preparation”.**

The product itself should now be treated as largely stable. The next development work should be growth infrastructure, not visual redesign or another major feature batch.

### Immediate sequence

1. Fix/complete growth analytics and attribution.
2. Verify Search Console/indexing and production launch checks.
3. Create the weekly metrics dashboard.
4. Prepare distribution assets/messages.
5. Begin small tracked distribution experiments.
6. Only then build the first acquisition game based on what the audience data tells us.

## Audit limitations

This audit verified the repository architecture, SEO assets, analytics implementation, CI/deployment configuration and external search visibility. It could not inspect private GA4/Search Console dashboards or production environment secrets, so actual GA4 data collection, Search Console indexing counts and real backup restoration must be verified separately in those systems.
