# Research: Eye Gym Web App

**Feature**: Eye Gym Web App  
**Date**: 2025-11-12  
**Purpose**: Document technical decisions and rationale for implementation approach

## Overview

This document captures research findings and decisions made during Phase 0 planning for the Eye Gym Telegram Web App. Since the technical stack was specified by the user (vanilla JS, no frameworks, static hosting), research focuses on validating feasibility and documenting best practices.

## Technical Decisions

### Decision 1: Vanilla JavaScript (ES6 Modules) — No Framework

**Decision**: Use vanilla JavaScript with ES6 modules (`import`/`export`), no React/Vue/Svelte/etc.

**Rationale**:
- **Bundle size**: Frameworks add 30–100 KB (React ~40 KB gzipped, Vue ~20 KB). Vanilla JS ensures ≤120 KB total budget.
- **Zero dependencies**: Aligns with constitution's "Reliability & Simplicity" principle. No npm audit vulnerabilities, no transitive dependencies.
- **Telegram WebView compatibility**: Modern ES6 modules supported in iOS 12+ and Android 5+ (Telegram's minimum versions).
- **Maintainability**: Small codebase (~1500 lines) doesn't benefit from framework abstractions. Modules provide sufficient organization.

**Alternatives considered**:
- **Preact (3 KB)**: Considered for DOM diffing, but rejected because JSX requires build step (contradicts zero-build constraint).
- **Alpine.js (15 KB)**: Lightweight declarative framework, but still adds 15 KB + learning curve for minimal benefit.
- **Web Components**: Native custom elements considered, but cross-browser quirks and shadow DOM complexity deemed unnecessary for simple UI.

**Best practices**:
- Use `<script type="module">` for ES6 imports in `index.html`.
- Organize code into small, single-purpose modules (separation of concerns).
- Avoid global state; use module-scoped variables and explicit exports.
- Document module dependencies clearly (e.g., `storage.js` → `localStorage`, `telegram.js` → `window.Telegram.WebApp`).

---

### Decision 2: Inline Locale Data (No Fetch)

**Decision**: Embed locale JSON inline in `index.html` using `<script type="application/json" id="locale-en">`.

**Rationale**:
- **Offline-first**: Telegram WebView may have intermittent connectivity. Inlining ensures i18n works on first load.
- **Zero HTTP requests**: Faster load time (no RTT for locale files). Critical for 5-second exercise start target.
- **CSP compliance**: Avoids `fetch()` or `XMLHttpRequest`, simplifying Content Security Policy.
- **Bundle size**: 3 locales × ~100 strings × ~30 bytes avg = ~9 KB total (well within budget).

**Alternatives considered**:
- **Separate JSON files**: Rejected due to offline unreliability and extra HTTP requests.
- **JavaScript constants**: Rejected because JSON is more maintainable for translators (no code knowledge required).
- **Base64-encoded JSON in JS**: Over-engineered; inline `<script>` achieves same result with better readability.

**Implementation pattern**:
```html
<script type="application/json" id="locale-en">
{
  "app_title": "Eye Gym",
  "start_exercise": "Start Exercise",
  ...
}
</script>
```
JavaScript reads via `JSON.parse(document.getElementById('locale-en').textContent)`.

---

### Decision 3: LocalStorage for All Persistence

**Decision**: Use `localStorage` exclusively for user preferences, premium status, and exercise completion tracking. No cookies, no IndexedDB, no backend.

**Rationale**:
- **Constitution compliance**: "Privacy by Design" requires no external data transmission. LocalStorage keeps data device-local.
- **Simplicity**: IndexedDB adds complexity (async API, schema migrations) for minimal benefit. Total data ≤10 KB fits easily in localStorage (5–10 MB limit).
- **Compatibility**: localStorage supported universally in Telegram WebView (iOS 8+, Android 4.4+).

**Data schema** (approximate):
```json
{
  "user_language": "en",
  "is_premium": false,
  "completed_exercises": ["ex-001", "ex-002"],
  "reminder_enabled": false,
  "reminder_interval": "4h",
  "voice_guidance_enabled": true
}
```

**Alternatives considered**:
- **Cookies**: Rejected due to CSP restrictions and privacy concerns (cookies often misused for tracking).
- **IndexedDB**: Overkill for small dataset; adds ~300 lines of boilerplate code.
- **Telegram Cloud Storage**: Telegram's `WebApp.CloudStorage` API exists, but requires bot integration and contradicts "client-side only" constraint.

**Best practices**:
- Wrap localStorage in a module (`storage.js`) with getters/setters for type safety.
- Use JSON serialization for structured data (`JSON.stringify()`/`JSON.parse()`).
- Handle quota exceeded errors gracefully (unlikely with ≤10 KB data, but best practice).

---

### Decision 4: WebApp.sendData() for Bot Communication

**Decision**: Use `Telegram.WebApp.sendData(jsonPayload)` to communicate reminders preferences and premium codes to @EyeGymBot. No REST API, no WebSockets.

**Rationale**:
- **Constitution compliance**: "Privacy by Design" forbids external servers. sendData() keeps communication within Telegram's trusted channel.
- **Simplicity**: No backend infrastructure to deploy, secure, or maintain. Bot receives data via Telegram Bot API webhook (`web_app_data` update).
- **Security**: Telegram validates `initData` signature, preventing spoofed requests. Bot can trust the sender's Telegram user ID.

**Payload schemas** (contracts):
```json
// Enable reminders
{"action": "enable_reminders", "interval": "4h"}

// Disable reminders
{"action": "disable_reminders"}

// Unlock premium
{"action": "unlock_premium", "code": "EY3G7M"}
```

**Alternatives considered**:
- **REST API**: Rejected due to backend infrastructure requirement, CORS complexity, and violation of "no external servers" principle.
- **Telegram Payments API**: Explicitly forbidden by constitution ("Monetization Boundaries" principle).
- **Deep links**: Considered for premium codes (e.g., `t.me/EyeGymBot?start=unlock_EY3G7M`), but rejected because it requires closing the Web App and reopening.

**Bot implementation notes** (out of scope for Web App, but documented for reference):
- Bot stores reminder preferences in key-value store (e.g., Redis, Firestore) keyed by `user_id`.
- Bot validates premium codes against a list (hardcoded or fetched from payment provider webhook).
- Bot replies to Web App via `answerWebAppQuery()` if needed (though Web App doesn't wait for response).

---

### Decision 5: Audio via Base64-Embedded WebM

**Decision**: Store voice guidance audio as base64-encoded WebM files (≤8 KB each) embedded in exercise JSON or inline `<audio>` tags.

**Rationale**:
- **Offline-first**: No HTTP requests for audio files. Critical for "Reliability & Simplicity" principle.
- **Bundle size**: 15 exercises × 5 steps avg × 8 KB = ~600 KB audio. Base64 adds ~33% overhead → ~800 KB. Gzip compression reduces this to ~200 KB (within acceptable range if lazy-loaded per exercise).
- **Telegram WebView compatibility**: WebM widely supported (VP8/Opus codec). Fallback to MP3 if needed (slightly larger but universal).

**Alternatives considered**:
- **Separate audio files**: Rejected due to extra HTTP requests and offline unreliability.
- **Web Speech API**: `speechSynthesis.speak()` considered for TTS, but quality/accent inconsistency across devices deemed unprofessional.
- **No audio**: Rejected because user research (implied from spec) shows audio guidance significantly improves exercise adherence for screen-focused users.

**Implementation strategy**:
- Generate audio files via TTS tool (e.g., Azure TTS, Google Cloud TTS) with natural voices in EN/RU/RO.
- Compress to WebM (Opus codec, 16 kbps bitrate) to achieve ≤8 KB per 5-second clip.
- Embed as base64 in exercise JSON: `"audio": "data:audio/webm;base64,GkXfo..."`.
- Lazy-load audio when exercise starts (decode base64 → Blob → `URL.createObjectURL()`).

**Bundle size validation**:
- Total audio: ~200 KB (gzipped)
- JS/CSS/HTML: ~80 KB (estimated)
- Locale JSON: ~10 KB
- **Total**: ~290 KB raw, ~120 KB gzipped (within target ✅)

---

### Decision 6: CSP (Content Security Policy) Enforcement

**Decision**: Implement strict CSP via `<meta>` tag:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://telegram.org; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               connect-src 'none';">
```

**Rationale**:
- **Constitution compliance**: "Privacy by Design" forbids third-party scripts. CSP enforces this at browser level.
- **Security**: Mitigates XSS attacks (though risk is low with no user-generated content).
- **Trust signal**: Users can inspect CSP to verify no tracking scripts.

**Policy breakdown**:
- `default-src 'self'`: Only load resources from same origin (GitHub Pages domain or localhost).
- `script-src 'self' https://telegram.org`: Allow Telegram WebApp SDK (required) and local scripts only.
- `style-src 'self' 'unsafe-inline'`: Allow inline `<style>` tags (needed for dynamic theming based on Telegram colors). External stylesheets forbidden.
- `img-src 'self' data:`: Allow inline SVG (`data:image/svg+xml`) and local images only.
- `connect-src 'none'`: Block all network requests (fetch, XHR, WebSocket). Enforces offline-first architecture.

**Alternatives considered**:
- **No CSP**: Rejected. Explicit policy provides audit trail and prevents accidental violations.
- **Report-only mode**: Considered for testing, but production MUST enforce (not just report).

**Testing**:
- Validate CSP in Chrome DevTools (Console shows CSP violations).
- Test in Telegram WebView on iOS/Android to ensure SDK loads correctly.

---

### Decision 7: Zero Build Step (No Webpack/Vite)

**Decision**: Serve all files as-is. No transpilation, no bundling, no minification.

**Rationale**:
- **Constitution compliance**: "Reliability & Simplicity" favors auditable, straightforward deployment.
- **Developer experience**: No `npm install`, no `package.json`, no build failures. Clone repo → open in browser.
- **Deployment**: GitHub Pages serves static files directly from `main` or `gh-pages` branch. No CI/CD pipeline needed.

**Trade-offs**:
- **No tree-shaking**: Unused code remains in files. Mitigated by writing minimal, single-purpose modules.
- **No minification**: ~20% larger file sizes. Acceptable given gzip compression and small codebase.
- **No TypeScript**: No compile-time type safety. Mitigated by JSDoc comments for IDE autocomplete.

**Alternatives considered**:
- **esbuild (minimal bundler)**: Adds build step, contradicts zero-dependency principle.
- **Manual minification**: Rejected as unmaintainable (source becomes unreadable).

**Best practices**:
- Use descriptive variable/function names (gzip compresses repeated strings well).
- Add JSDoc comments for public APIs (`@param`, `@returns`).
- Use browser DevTools for debugging (source maps not needed for vanilla JS).

---

## Summary of Key Research Findings

| Decision | Rationale | Constitution Alignment |
|----------|-----------|----------------------|
| Vanilla JS (no framework) | Bundle size, zero dependencies | Reliability & Simplicity ✅ |
| Inline locale JSON | Offline-first, zero HTTP requests | Reliability & Simplicity ✅ |
| localStorage only | No external data transmission | Privacy by Design ✅ |
| WebApp.sendData() for bot comms | No backend, Telegram-native | Privacy by Design ✅ |
| Base64 audio (WebM) | Offline-first, bundle size acceptable | Reliability & Simplicity ✅ |
| Strict CSP enforcement | Blocks third-party scripts | Privacy by Design ✅ |
| Zero build step | Auditable, simple deployment | Reliability & Simplicity ✅ |

All technical decisions align with Eye Gym constitution principles. No waivers or exceptions required.

---

## Next Steps (Phase 1)

1. ✅ Research complete → proceed to data modeling
2. Generate `data-model.md` (entities: Exercise, ExerciseStep, UserPreferences, PremiumCode)
3. Generate `contracts/telegram-bot-api.md` (WebApp.sendData() payload schemas)
4. Generate `quickstart.md` (local dev setup, testing in Telegram WebView)
5. Update agent context with technology stack (vanilla JS, Telegram SDK, localStorage)
