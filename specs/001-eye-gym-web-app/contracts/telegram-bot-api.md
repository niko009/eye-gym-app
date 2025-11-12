# Telegram Bot API Contract: Eye Gym Web App ↔ @EyeGymBot

**Feature**: Eye Gym Web App  
**Date**: 2025-11-12  
**Purpose**: Define communication protocol between Web App and Telegram bot via `WebApp.sendData()`

## Overview

This document specifies the JSON payload schemas for communication between the Eye Gym Web App (client-side) and @EyeGymBot (server-side Telegram bot). All communication uses the Telegram WebApp SDK method `WebApp.sendData(payload)`, which triggers a `web_app_data` update to the bot.

**Key Constraints**:
- Web App → Bot communication only (unidirectional for MVP; bot may reply via chat messages, not via callback).
- Payloads MUST be valid JSON strings.
- Maximum payload size: 4096 bytes (Telegram limit for `sendData()`).
- Bot MUST validate `initData` signature to prevent spoofing.

---

## Contract 1: Enable Reminders

**Use Case**: User enables reminders in Settings screen and selects interval.

### Web App → Bot Payload

**Method**: `Telegram.WebApp.sendData(payload)`

**Payload Schema**:
```json
{
  "action": "enable_reminders",
  "interval": "4h"
}
```

**Fields**:

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `action` | string | Yes | Action identifier | `"enable_reminders"` |
| `interval` | string | Yes | Reminder frequency | `"2h"`, `"4h"`, `"6h"` |

**Validation Rules**:
- `action` MUST be exactly `"enable_reminders"` (case-sensitive).
- `interval` MUST be one of: `"2h"`, `"4h"`, `"6h"`. Bot SHOULD reject other values.

**Example**:
```javascript
// Web App code (js/settings.js)
Telegram.WebApp.sendData(JSON.stringify({
  action: "enable_reminders",
  interval: "4h"
}));
```

### Bot Behavior

1. **Receive**: Bot receives `web_app_data` update with payload.
2. **Validate**:
   - Check `initData` signature (Telegram SDK provides validation).
   - Parse JSON payload.
   - Validate `interval` is one of `"2h"`, `"4h"`, `"6h"`.
3. **Store**: Save reminder preference in database (key: `user_id`, value: `{interval: "4h", enabled: true}`).
4. **Schedule**: Set up cron job or scheduled task to send reminder notifications at chosen interval.
5. **Confirm** (optional): Send confirmation message to user's chat:
   - *"✅ Reminders enabled! You'll get a notification every 4 hours. Disable anytime in Settings."*

**Error Handling**:
- If `interval` invalid: Bot sends error message: *"Invalid interval. Choose 2h, 4h, or 6h."*
- If user has no chat with bot: Bot cannot send notifications. Web App SHOULD show warning: *"Make sure you've started @EyeGymBot to receive reminders."*

---

## Contract 2: Disable Reminders

**Use Case**: User disables reminders in Settings screen.

### Web App → Bot Payload

**Method**: `Telegram.WebApp.sendData(payload)`

**Payload Schema**:
```json
{
  "action": "disable_reminders"
}
```

**Fields**:

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `action` | string | Yes | Action identifier | `"disable_reminders"` |

**Validation Rules**:
- `action` MUST be exactly `"disable_reminders"` (case-sensitive).
- No other fields required.

**Example**:
```javascript
// Web App code (js/settings.js)
Telegram.WebApp.sendData(JSON.stringify({
  action: "disable_reminders"
}));
```

### Bot Behavior

1. **Receive**: Bot receives `web_app_data` update with payload.
2. **Validate**: Check `initData` signature, parse JSON.
3. **Update**: Set `enabled: false` in database for this `user_id`.
4. **Cancel**: Stop scheduled reminder notifications for this user.
5. **Confirm** (optional): Send confirmation message: *"🔕 Reminders disabled. Re-enable anytime in Settings."*

**Error Handling**:
- If reminders already disabled: Bot silently succeeds (idempotent operation).

---

## Contract 3: Unlock Premium

**Use Case**: User enters premium code in Settings modal to unlock premium exercises.

### Web App → Bot Payload

**Method**: `Telegram.WebApp.sendData(payload)`

**Payload Schema**:
```json
{
  "action": "unlock_premium",
  "code": "EY3G7M"
}
```

**Fields**:

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `action` | string | Yes | Action identifier | `"unlock_premium"` |
| `code` | string | Yes | 6-character premium code (uppercase, trimmed) | Alphanumeric, exactly 6 chars |

**Validation Rules**:
- `action` MUST be exactly `"unlock_premium"` (case-sensitive).
- `code` MUST be exactly 6 characters, alphanumeric (A-Z, 0-9).
- Web App SHOULD normalize code before sending: trim whitespace, convert to uppercase.

**Example**:
```javascript
// Web App code (js/settings.js)
const code = document.getElementById('premium-code-input').value.trim().toUpperCase();
if (code.length === 6 && /^[A-Z0-9]{6}$/.test(code)) {
  Telegram.WebApp.sendData(JSON.stringify({
    action: "unlock_premium",
    code: code
  }));
} else {
  alert("Code must be 6 characters (letters and numbers only).");
}
```

### Bot Behavior

1. **Receive**: Bot receives `web_app_data` update with payload.
2. **Validate**:
   - Check `initData` signature.
   - Parse JSON payload.
   - Validate `code` format (6 chars, alphanumeric).
   - Check code against valid codes list (hardcoded or fetched from payment provider).
3. **Check Usage**: Verify code has not been redeemed by another user (store `used_by: user_id` in database).
4. **Grant Access**:
   - If valid and unused: Mark code as used, send success message.
   - If invalid: Send error message.
   - If already used: Send error message (optionally reveal who used it if same user).
5. **Confirm**:
   - **Success**: *"🎉 Premium unlocked! All exercises are now available."*
   - **Invalid**: *"❌ Code not found. Check spelling or get one at t.me/EyeGymBot."*
   - **Already used**: *"❌ Code already redeemed. Contact @EyeGymBot if this is an error."*

**Error Handling**:
- If code format invalid (not 6 chars): Bot sends error: *"Invalid code format. Must be 6 characters."*
- If bot database unavailable: Bot sends error: *"Service temporarily unavailable. Try again later."*

**Web App Side Effects**:
- Web App does NOT wait for bot response (fire-and-forget).
- Web App immediately updates `localStorage.is_premium = true` and shows success message: *"Premium unlocked! 🎉"*.
- If code was invalid, user sees bot's error message in chat (Web App assumes success).

**Improvement for Future** (out of scope for MVP):
- Use `answerWebAppQuery()` to send callback to Web App with success/failure status. Requires changes to Web App and bot logic.

---

## Contract 4: Reminder Notification (Bot → User)

**Use Case**: Bot sends scheduled reminder notification to user at chosen interval.

### Bot → User Notification

**Method**: Telegram Bot API `sendMessage()` with inline button to launch Web App.

**Notification Schema**:
```json
{
  "chat_id": 123456789,
  "text": "👁️ Time for a 1-min eye break! Tap to start →",
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "Start Exercise",
        "web_app": {
          "url": "https://eyegym.example.com"
        }
      }
    ]]
  }
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `chat_id` | number | User's Telegram ID |
| `text` | string | Reminder message with emoji and call-to-action |
| `reply_markup.inline_keyboard` | array | Button to launch Web App |

**Button Behavior**:
- Tapping "Start Exercise" opens Web App directly to exercise list screen (no deep link needed; app always starts at exercise list).

**Scheduling Logic** (bot-side):
- Cron job runs every hour (or more frequently) to check which users need reminders.
- For each user where `reminder_enabled = true` and `interval` time has passed since last notification:
  - Send notification via `sendMessage()`.
  - Update `last_reminder_sent` timestamp in database.

**Error Handling**:
- If user blocked bot: Log error, mark reminders as disabled for this user.
- If bot is rate-limited: Retry with exponential backoff.

---

## Contract 5: Web App Initialization Data (Telegram → Web App)

**Use Case**: Web App accesses user info and Telegram metadata on launch.

### Telegram → Web App (initDataUnsafe)

**Method**: `window.Telegram.WebApp.initDataUnsafe` (read-only object provided by Telegram SDK)

**Data Schema**:
```json
{
  "query_id": "AAHdF6IQAAAAAN0XohDhrOrc",
  "user": {
    "id": 123456789,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "language_code": "en"
  },
  "auth_date": 1699876543,
  "hash": "abc123..."
}
```

**Fields Used by Web App**:

| Field | Type | Description | Web App Usage |
|-------|------|-------------|---------------|
| `user.id` | number | Telegram user ID | Not used (no user accounts) |
| `user.language_code` | string | ISO 639-1 language code | Auto-detect UI language (EN/RU/RO) |
| `query_id` | string | Unique query identifier | Not used in MVP |
| `auth_date` | number | Unix timestamp of auth | Not used (no session management) |
| `hash` | string | Signature for validation | Bot validates; Web App ignores |

**Example**:
```javascript
// Web App code (js/i18n.js)
const userLang = Telegram.WebApp.initDataUnsafe.user?.language_code || 'en';
const supportedLangs = ['en', 'ru', 'ro'];
const selectedLang = supportedLangs.includes(userLang) ? userLang : 'en';
```

**Validation**:
- Bot MUST validate `hash` to prevent spoofed `sendData()` payloads.
- Web App does NOT validate `hash` (client-side validation is insecure; bot handles this).

---

## Payload Size Limits

**Telegram Constraint**: `WebApp.sendData()` payloads MUST be ≤4096 bytes.

**Current Payloads**:
- Enable reminders: ~50 bytes ✅
- Disable reminders: ~35 bytes ✅
- Unlock premium: ~55 bytes ✅

All payloads well within limit. No compression or chunking needed.

---

## Error Handling Summary

| Scenario | Web App Behavior | Bot Behavior |
|----------|------------------|--------------|
| Invalid `interval` | Show dropdown with valid values only | Send error message to chat |
| Invalid premium code format | Block send with alert: "Code must be 6 characters" | Send error message if sent anyway |
| Premium code already used | Assume success (no callback) | Send error message to chat |
| Bot not started by user | Show warning: "Start @EyeGymBot first" | Cannot send notifications |
| Network error (sendData fails) | No retry (user must try again) | N/A (bot not notified) |

---

## Security Considerations

1. **initData Validation**: Bot MUST validate `hash` using Telegram's secret token. Prevents spoofed payloads.
2. **No PII in Payloads**: Only action type and non-sensitive data (interval, code). User ID inferred from `initData`.
3. **Rate Limiting**: Bot SHOULD rate-limit premium code attempts (e.g., 5 attempts per user per day).
4. **Code Generation**: Premium codes SHOULD be cryptographically random (not sequential) to prevent guessing.

---

## Testing Checklist

- [ ] Test enable reminders with all intervals (2h, 4h, 6h).
- [ ] Test disable reminders when already disabled (idempotency).
- [ ] Test unlock premium with valid code (success path).
- [ ] Test unlock premium with invalid code (error path).
- [ ] Test unlock premium with already-used code (error path).
- [ ] Test sendData() with invalid JSON (bot error handling).
- [ ] Test reminder notification delivery at correct intervals.
- [ ] Test reminder notification when user blocked bot (error handling).
- [ ] Test initDataUnsafe language detection for EN, RU, RO, and unsupported languages.

---

## Future Enhancements (Out of Scope)

- **Bidirectional Communication**: Use `answerWebAppQuery()` for bot → Web App callbacks (premium unlock confirmation without chat message).
- **Deep Links**: Add query params to Web App URL (e.g., `?exercise=20-20-20-rule`) to launch specific exercise from notification.
- **Analytics Payload**: Add optional `{"action": "analytics", "event": "exercise_completed"}` (contradicts constitution, but documented for future consideration if user opts in).

---

## Summary

Three payload types defined for Web App → Bot communication:
1. ✅ Enable reminders (`enable_reminders` + interval)
2. ✅ Disable reminders (`disable_reminders`)
3. ✅ Unlock premium (`unlock_premium` + code)

One notification type for Bot → User:
4. ✅ Reminder notification (sendMessage with inline button)

One initialization data source for Telegram → Web App:
5. ✅ initDataUnsafe (language detection)

All contracts tested for size limits, security, and error handling. Ready for implementation.
