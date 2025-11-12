# Data Model: Eye Gym Web App

**Feature**: Eye Gym Web App  
**Date**: 2025-11-12  
**Purpose**: Define data structures for exercises, user preferences, and premium codes

## Overview

This document defines the data model for the Eye Gym Web App. All data is stored client-side (localStorage or inline JSON) with no backend database. Data structures are optimized for simplicity and bundle size.

---

## Entity 1: Exercise

Represents a single guided eye exercise (free or premium).

### Attributes

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Unique identifier (kebab-case) | `"20-20-20-rule"` |
| `title` | object | Yes | Localized titles (EN/RU/RO keys) | `{"en": "20-20-20 Rule", "ru": "Правило 20-20-20"}` |
| `description` | object | Yes | Localized short descriptions | `{"en": "Take a break every 20 minutes"}` |
| `duration_sec` | number | Yes | Total exercise duration in seconds | `60` |
| `difficulty` | string | Yes | Difficulty level: `"beginner"` or `"intermediate"` | `"beginner"` |
| `steps` | array | Yes | Array of ExerciseStep objects | `[{...}, {...}]` |
| `is_premium` | boolean | Yes | Whether exercise requires premium unlock | `false` |
| `has_audio` | boolean | Yes | Whether voice guidance is available | `true` |
| `tags` | array | No | Optional tags for filtering (future use) | `["quick", "focus"]` |

### Validation Rules

- `id` MUST be unique across all exercises (free + premium).
- `title` and `description` MUST include keys for all three languages: `en`, `ru`, `ro`.
- `duration_sec` MUST match sum of all step durations (±2 seconds tolerance).
- `difficulty` MUST be either `"beginner"` or `"intermediate"` (no advanced tier in MVP).
- `steps` array MUST contain at least 1 step and at most 10 steps.
- `is_premium` MUST be `false` for exercises in `/exercises/free.json` and `true` for `/exercises/premium.json`.

### Example JSON

```json
{
  "id": "20-20-20-rule",
  "title": {
    "en": "20-20-20 Rule",
    "ru": "Правило 20-20-20",
    "ro": "Regula 20-20-20"
  },
  "description": {
    "en": "Take a 20-second break every 20 minutes and look at something 20 feet away",
    "ru": "Каждые 20 минут делайте 20-секундный перерыв и смотрите на что-то в 20 футах",
    "ro": "Faceți o pauză de 20 de secunde la fiecare 20 de minute și uitați-vă la ceva la 20 de picioare distanță"
  },
  "duration_sec": 60,
  "difficulty": "beginner",
  "steps": [
    {
      "step_num": 1,
      "instruction": {
        "en": "Look away from your screen",
        "ru": "Отведите взгляд от экрана",
        "ro": "Uitați-vă departe de ecran"
      },
      "duration_sec": 5,
      "audio_base64": null
    },
    {
      "step_num": 2,
      "instruction": {
        "en": "Focus on an object 20 feet (6 meters) away",
        "ru": "Сосредоточьтесь на объекте в 6 метрах",
        "ro": "Concentrați-vă pe un obiect la 6 metri distanță"
      },
      "duration_sec": 20,
      "audio_base64": "data:audio/webm;base64,GkXfo..."
    },
    {
      "step_num": 3,
      "instruction": {
        "en": "Blink slowly 5 times",
        "ru": "Медленно моргните 5 раз",
        "ro": "Clipiți încet de 5 ori"
      },
      "duration_sec": 10,
      "audio_base64": null
    }
  ],
  "is_premium": false,
  "has_audio": true,
  "tags": ["quick", "focus"]
}
```

### State Transitions

Exercises are immutable (read-only). The only state change is tracking completion:
- **Not started** → User has never run this exercise.
- **Completed** → User finished all steps at least once. Tracked in `UserPreferences.completed_exercises[]`.

---

## Entity 2: ExerciseStep

Represents one step within an Exercise. Embedded in Exercise.steps array.

### Attributes

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `step_num` | number | Yes | Sequential step number (1-indexed) | `1` |
| `instruction` | object | Yes | Localized instruction text (EN/RU/RO) | `{"en": "Breathe deeply"}` |
| `duration_sec` | number | Yes | Step duration in seconds | `10` |
| `audio_base64` | string\|null | No | Base64-encoded audio file (WebM or MP3) | `"data:audio/webm;base64,..."` or `null` |

### Validation Rules

- `step_num` MUST be sequential starting from 1 (no gaps).
- `instruction` MUST include keys for all three languages: `en`, `ru`, `ro`.
- `duration_sec` MUST be between 3 and 60 seconds.
- `audio_base64` MAY be `null` if no voice guidance for this step. If present, MUST be valid data URL with `audio/webm` or `audio/mpeg` MIME type.

### Relationships

- **Parent**: Exercise (one-to-many: one Exercise has many ExerciseSteps).
- ExerciseStep cannot exist independently; always embedded in Exercise JSON.

---

## Entity 3: UserPreferences

Represents user settings and state stored in localStorage.

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_language` | string | Yes | (auto-detected) | ISO 639-1 code: `"en"`, `"ru"`, or `"ro"` |
| `is_premium` | boolean | Yes | `false` | Whether user has unlocked premium exercises |
| `completed_exercises` | array | Yes | `[]` | Array of completed exercise IDs (strings) |
| `reminder_enabled` | boolean | Yes | `false` | Whether reminders are enabled |
| `reminder_interval` | string | Yes | `"4h"` | Reminder interval: `"2h"`, `"4h"`, or `"6h"` |
| `voice_guidance_enabled` | boolean | Yes | `true` | Global voice guidance toggle |
| `theme_mode` | string | No | `"auto"` | Theme preference: `"auto"`, `"light"`, or `"dark"` (future use) |

### Validation Rules

- `user_language` MUST be one of: `"en"`, `"ru"`, `"ro"`. Fallback to `"en"` if invalid.
- `is_premium` MUST be boolean. Default `false`.
- `completed_exercises` MUST be an array of strings. Duplicates allowed (no enforcement).
- `reminder_interval` MUST be one of: `"2h"`, `"4h"`, `"6h"`. Default `"4h"` if invalid.
- `voice_guidance_enabled` MUST be boolean. Default `true`.

### Storage Schema (localStorage)

Stored as single JSON object in `localStorage` key: `"eyegym_preferences"`.

```json
{
  "user_language": "en",
  "is_premium": false,
  "completed_exercises": ["20-20-20-rule", "blinking-drill"],
  "reminder_enabled": false,
  "reminder_interval": "4h",
  "voice_guidance_enabled": true
}
```

### State Transitions

| Event | State Change | Side Effect |
|-------|--------------|-------------|
| User completes exercise | Add exercise ID to `completed_exercises[]` | Update localStorage |
| User enables reminders | Set `reminder_enabled = true` | Call `WebApp.sendData('{"action":"enable_reminders","interval":"4h"}')` |
| User disables reminders | Set `reminder_enabled = false` | Call `WebApp.sendData('{"action":"disable_reminders"}')` |
| User unlocks premium (valid code) | Set `is_premium = true` | Update localStorage, refresh exercise list UI |
| User toggles voice guidance | Toggle `voice_guidance_enabled` | Update localStorage, apply immediately to active session |
| User changes language (future) | Update `user_language` | Reload UI strings from new locale |

---

## Entity 4: PremiumCode

Represents a 6-character alphanumeric code for unlocking premium exercises.

### Attributes

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `code` | string | Yes | 6-character alphanumeric code (uppercase) | `"EY3G7M"` |
| `valid` | boolean | Yes | Whether code is valid (checked by bot) | `true` |
| `used_by` | number | No | Telegram user ID who redeemed code (bot-side tracking) | `123456789` |
| `created_at` | string | No | ISO 8601 timestamp (bot-side tracking) | `"2025-11-12T10:30:00Z"` |

### Validation Rules

- `code` MUST be exactly 6 characters, alphanumeric only (A-Z, 0-9, case-insensitive).
- `code` is normalized to uppercase before validation (e.g., `"ey3g7m"` → `"EY3G7M"`).
- Whitespace is trimmed before validation.

### Bot-Side Validation Logic (Out of Scope for Web App)

1. Bot receives `WebApp.sendData('{"action":"unlock_premium","code":"EY3G7M"}')`.
2. Bot normalizes code: trim whitespace, uppercase.
3. Bot checks against list of valid codes (hardcoded or fetched from payment provider).
4. If valid and unused:
   - Mark code as used (store `user_id` in database).
   - Reply to Web App (if needed) or user sees success in Web App localStorage update.
5. If invalid or already used:
   - Bot does not reply (or replies with error via `answerWebAppQuery()`).
   - Web App shows error message: "Code not found. Check spelling or get one at t.me/EyeGymBot".

### Web App Side

Web App does not validate codes locally (no hardcoded list). It:
1. Sends code to bot via `sendData()`.
2. Waits briefly (500ms) for user to receive bot confirmation message in chat.
3. Shows success message: "Premium unlocked! 🎉" (assumes success; no callback from bot).
4. Updates `localStorage.is_premium = true`.

**Note**: This is fire-and-forget. If code is invalid, user must manually check chat for error message from bot.

---

## Data Relationships

```text
Exercise (1) ──contains──> (many) ExerciseStep
UserPreferences ──references──> (many) Exercise.id (via completed_exercises[])
PremiumCode ──unlocks──> (many) Exercise (where is_premium = true)
```

**No foreign keys or referential integrity** (client-side JSON data, no database).

---

## Data Sources

| Entity | Source | Format | Location |
|--------|--------|--------|----------|
| Exercise (free) | Static JSON file | JSON array | `/exercises/free.json` |
| Exercise (premium) | Static JSON file | JSON array | `/exercises/premium.json` |
| ExerciseStep | Embedded in Exercise JSON | JSON object | Within `Exercise.steps[]` |
| UserPreferences | localStorage | JSON object | `localStorage.eyegym_preferences` |
| PremiumCode | User input → Bot validation | Plain string | Entered in Settings modal |

---

## Bundle Size Impact

| Data Type | Count | Avg Size | Total Size (gzipped) |
|-----------|-------|----------|---------------------|
| Free exercises (JSON) | 10 | ~2 KB each | ~8 KB |
| Premium exercises (JSON) | 5 | ~2 KB each | ~4 KB |
| Audio files (base64 in JSON) | ~50 steps | ~8 KB each | ~200 KB |
| UserPreferences (localStorage) | 1 | ~500 bytes | <1 KB |
| **Total** | — | — | **~212 KB** |

With JS/CSS/HTML (~80 KB) + locales (~10 KB) = **~302 KB raw** → **~120 KB gzipped** (within target ✅).

---

## Security Considerations

1. **No sensitive data in localStorage**: Premium status is boolean flag, not payment info. No PII stored.
2. **No code validation client-side**: Prevents reverse-engineering valid codes. Bot validates server-side.
3. **LocalStorage accessible to all scripts**: Not a risk (no third-party scripts allowed by CSP).
4. **No encryption**: Not needed (no sensitive data; localStorage is device-local).

---

## Future Extensions (Out of Scope for MVP)

- **Exercise history**: Track timestamps of completions (requires date storage in `completed_exercises[]`).
- **Custom exercises**: Allow user to create/edit exercises (requires JSON schema versioning).
- **Sync across devices**: Use Telegram Cloud Storage API (requires bot integration changes).
- **Exercise tags/filters**: Add `tags[]` to Exercise entity and filter UI (partially implemented in schema).

---

## Summary

All entities defined with clear validation rules and relationships. Data model supports:
- ✅ 15 exercises (10 free + 5 premium) with localized content
- ✅ Step-by-step guidance with optional audio
- ✅ User preferences and premium status persistence
- ✅ Bot-validated premium codes (Web App side documented)

Data model aligns with constitution constraints: client-side only, no external servers, bundle size within target.
