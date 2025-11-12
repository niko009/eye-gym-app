<!--
Sync Impact Report

Version change: [CONSTITUTION_VERSION] -> 1.0.0

Modified principles:
- [PRINCIPLE_1_NAME] -> Telegram-Native UX
- [PRINCIPLE_2_NAME] -> Privacy by Design
- [PRINCIPLE_3_NAME] -> Multilingual Compliance
- [PRINCIPLE_4_NAME] -> Monetization Boundaries
- [PRINCIPLE_5_NAME] -> Reliability & Simplicity
- (added) PRINCIPLE_6 -> User Autonomy
- (added) PRINCIPLE_7 -> Transparency

Added sections:
- Development Constraints (replaces SECTION_2)
- Development Workflow & Quality Gates (replaces SECTION_3)

Removed sections: none

Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/ ⚠ not present - skipped

Deferred items / TODOs:
- RATIFICATION_DATE: TODO(RATIFICATION_DATE): confirm original adoption date
-->

# Eye Gym (Telegram Web App) Constitution

## Core Principles

### Telegram-Native UX
UI MUST follow Telegram’s design language and interaction model. Implementations MUST use the
Telegram Web App SDK for theming, alerts, navigation, and native header/footer controls. The
Web App MUST NOT implement custom navigation bars or persistent chrome that duplicates Telegram
controls. Rationale: preserve predictable UX and respect host chrome to avoid platform
conflicts; enforcement is a checklist during reviews and manual QA.

### Privacy by Design
Users' privacy is non-negotiable. The project MUST NOT include telemetry, analytics, or
third-party scripts. User data (for example, reminder preferences or premium-status codes)
MUST be stored only in `localStorage` or passed explicitly to the bot. No personal data MAY be
transmitted to external servers under any circumstances. Rationale: minimizes external
attack surface and aligns with Telegram's expectation of in-chat data custody.

### Multilingual Compliance
The Web App MUST support exactly three languages: English, Russian, Romanian. Language MUST be
detected from `WebApp.initDataUnsafe.user.language_code`; if detection fails, fallback to
English. All UI strings MUST be externalized (no hardcoded text). Rationale: limits translation
surface while ensuring regional coverage; externalized strings allow auditable localization.

### Monetization Boundaries
Premium content MAY be unlocked only via user-entered codes (e.g., codes from Boosty or
GitHub Sponsors). The Web App MUST NOT initiate any payment flow inside the Web App; instead,
it MUST call `openLink()` to navigate users to an external payment or subscription page. The
Web App MUST NOT use Telegram Payments or any in-app purchase APIs. Rationale: keep billing
flows auditable and out-of-scope for the Web App to avoid policy and compliance friction.

### Reliability & Simplicity
The project MUST be small and dependency-free: total JS bundle size MUST be ≤ 120 KB (gzipped),
and the codebase MUST avoid third-party dependencies (vanilla JavaScript only). All assets must
be self-contained (inline SVG, base64-encoded audio where needed). Rationale: keep the app
fast, auditable, and easy to host inside Telegram’s WebView.

### User Autonomy
All features, especially push-like features such as reminders, MUST be opt-in. Every permission
or gate MUST present a clear, plain-language explanation (for example: “Reminders are sent by
@EyeGymBot — you can disable anytime”). Rationale: empower users and reduce accidental
engagement or opt-ins.

### Transparency
A Privacy Policy MUST be accessible via a footer link from the Web App. The policy text MUST
explicitly state: “We do not collect, store, or transmit your personal data.” Rationale: clear
communication builds trust and aligns with the Privacy by Design principle.

## Development Constraints
These constraints flow directly from the principles above and are mandatory for all work:

- JavaScript only: zero external runtime dependencies; no bundlers that introduce opaque
	transitive packages unless they can be audited and kept inline under the bundle size limit.
- Bundle size: application JS (gzipped) MUST be ≤ 120 KB. This includes any necessary
	runtime glue; failures must be justified and approved by governance (see Governance).
- Storage: only `localStorage` or explicit bot-passed state; NO external servers for user data.
- Localization: all UI strings MUST be stored in a single `i18n` JSON file per language and
	loaded based on `WebApp.initDataUnsafe.user.language_code`.
- Payments: all monetization MUST use external links via `openLink()`; no in-app payment APIs.
- Assets: use inline SVGs and base64 audio; avoid remote asset loading at runtime.

## Development Workflow & Quality Gates
The project follows a lightweight workflow with mandatory quality gates derived from the
constitution:

1. Constitution Check (automated checklist + PR description): PRs MUST include a short
	 statement confirming compliance with the seven core principles and list any waivers.
2. Bundle-size check: PRs that touch frontend assets MUST run the bundle-size measurement and
	 include artifact proving gzipped size ≤ 120 KB.
3. Localization check: New UI strings MUST be added only to the externalized locales and
	 translations MUST include at minimum the English string before merge.
4. Privacy check: PRs MUST not introduce third-party scripts or external network calls that
	 transmit user data. Any required external communication must be documented and approved.

## Governance
Amendments, versioning, and compliance rules:

- Amendment procedure: Proposals to change the constitution MUST be opened as a PR that
	explains the rationale, migration plan, and tests for compliance. Amendments require
	approval by at least one maintainer and one reviewer (or a quorum defined in project
	governance documents). Non-technical wording edits that don't change obligations qualify as
	PATCH-level (see versioning) but still require review.
- Versioning policy: The constitution follows semantic versioning:
	- MAJOR: Backward-incompatible governance or principle removals/major redefinitions.
	- MINOR: Addition of new principle(s) or material expansion of guidance.
	- PATCH: Clarifications, wording fixes, or non-semantic refinements.
	The current ratified version of this document is 1.0.0.
- Compliance reviews: Every feature PR MUST include a short compliance checklist referencing
	the core principles. Non-compliant changes require an explicit waiver PR that documents
	technical constraints, alternatives considered, and an expiration date for the waiver.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2025-11-12
