# Feature Specification: Eye Gym Web App

**Feature Branch**: `001-eye-gym-web-app`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "Build a Telegram Web App for 'Eye Gym' — a tool to help users reduce digital eye strain through short, guided eye exercises."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant Exercise Access (Priority: P1)

As a new user opening the app for the first time, I see a list of available eye exercises immediately (within 5 seconds) without any onboarding or login screens. I can distinguish free exercises from premium ones and start a session instantly.

**Why this priority**: This is the core value proposition — users need quick relief from eye strain. If they encounter friction or delays, they'll close the app. This story delivers immediate utility and demonstrates the app's purpose.

**Independent Test**: Open the Web App from Telegram. Verify that within 5 seconds, the exercise list screen appears with at least 10 free exercises visible, each showing title, duration, and difficulty. Tap any free exercise to confirm it launches successfully.

**Acceptance Scenarios**:

1. **Given** the user opens the Eye Gym Web App from Telegram, **When** the app loads, **Then** the exercise list screen appears within 5 seconds showing at least 10 free exercises with visible titles, duration estimates, and difficulty levels.
2. **Given** the exercise list is displayed, **When** the user taps any free exercise, **Then** the exercise session screen opens immediately with step-by-step instructions.
3. **Given** the exercise list is displayed, **When** the user taps a premium exercise, **Then** a clear message appears: "Unlock premium exercises by entering a code in Settings ⚙️" with a link to settings.

---

### User Story 2 - Guided Exercise Session (Priority: P1)

As a user starting an exercise, I am guided step-by-step with clear text instructions, visual progress indicators, and optional voice guidance. I can pause, skip steps, or mark the session as complete, and the experience is calm and distraction-free.

**Why this priority**: Without a functional exercise session, the app has no purpose. This story is tied with P1 because it completes the minimum viable loop: list → start → complete.

**Independent Test**: Select any free exercise from the list. Verify the session screen is full-screen, distraction-free, shows step-by-step instructions with a progress indicator, and offers Pause/Skip/Done controls. Complete or exit the session and confirm return to the exercise list.

**Acceptance Scenarios**:

1. **Given** the user starts an exercise from the list, **When** the session screen loads, **Then** it displays full-screen with the first step's instruction in large, readable text.
2. **Given** an exercise session is active, **When** the user views the screen, **Then** visual progress indicators (timer bar and step counter like "Step 2 of 5") are visible.
3. **Given** an exercise session is active, **When** the user taps "Pause", **Then** the exercise timer stops and the user sees "Paused — tap Resume to continue".
4. **Given** an exercise session is active, **When** the user taps "Skip", **Then** the current step is skipped and the next step displays immediately.
5. **Given** the user completes all steps, **When** the final step finishes, **Then** a completion message "✅ Done!" appears with options to "Repeat" or "Back to list".
6. **Given** voice guidance is enabled globally, **When** each step begins, **Then** the instruction is read aloud automatically.

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

### User Story 3 - Daily Reminder Opt-In (Priority: P2)

As a user who wants to build a habit, I enable daily reminders in the Settings screen, choose my preferred interval (every 2h, 4h, or 6h), and receive periodic notifications from @EyeGymBot reminding me to take eye breaks. I can disable reminders anytime.

**Why this priority**: Reminders increase engagement and habit formation, but they are optional. The app is fully functional without them, so this is a P2 feature that enhances retention.

**Independent Test**: Navigate to Settings, enable reminders, and select an interval. Verify that the bot sends a notification at the chosen interval. Disable reminders in Settings and confirm notifications stop.

**Acceptance Scenarios**:

1. **Given** the user opens the Settings screen, **When** they toggle "Enable reminders" to ON, **Then** a dropdown appears offering intervals: "Every 2 hours", "Every 4 hours", "Every 6 hours".
2. **Given** the user selects an interval and saves, **When** the chosen time passes, **Then** @EyeGymBot sends a push notification: "👁️ Time for a 1-min eye break! Tap to start →".
3. **Given** the user receives a reminder notification, **When** they tap it, **Then** the Web App opens directly to the exercise list screen.
4. **Given** reminders are enabled, **When** the user toggles "Enable reminders" to OFF in Settings, **Then** no further notifications are sent by @EyeGymBot.

---

### User Story 4 - Premium Unlock via Code (Priority: P2)

As a supporter who has donated or subscribed, I enter a 6-character premium code in the Settings screen to unlock all premium exercises permanently on this device. Invalid codes show a clear error message with guidance.

**Why this priority**: Monetization is important for sustainability, but it's not required for the core free experience. Premium unlocks add value for supporters without blocking free users.

**Independent Test**: Navigate to Settings, tap "Enter Premium Code", input a valid 6-character code, and confirm all premium exercises become accessible. Test with an invalid code and verify a clear error message appears.

**Acceptance Scenarios**:

1. **Given** the user taps "Enter Premium Code" in Settings, **When** the modal opens, **Then** an input field and "Unlock" button appear.
2. **Given** the user enters a valid 6-character code (e.g., `EY3G7M`), **When** they tap "Unlock", **Then** all premium exercises become available immediately and the modal closes with a success message: "Premium unlocked! 🎉".
3. **Given** the user enters an invalid code, **When** they tap "Unlock", **Then** an error message appears: "Code not found. Check spelling or get one at t.me/EyeGymBot".
4. **Given** premium is unlocked, **When** the user reopens the app on the same device, **Then** premium exercises remain unlocked without re-entering the code.

---

### User Story 5 - Automatic Language Selection (Priority: P3)

As a multilingual user (Russian, English, or Romanian), the app interface automatically matches my Telegram language preference without requiring manual selection. All UI elements, instructions, and error messages appear in my language.

**Why this priority**: Language support is essential for the target audience, but auto-detection handles most cases seamlessly. Manual switching is explicitly out-of-scope for MVP, making this P3 infrastructure work.

**Independent Test**: Open the app with Telegram set to Russian, verify all UI text is in Russian. Change Telegram language to Romanian, reopen the app, and verify all text switches to Romanian. Test with English as fallback for unsupported languages.

**Acceptance Scenarios**:

1. **Given** the user's Telegram language is set to Russian, **When** they open the Eye Gym Web App, **Then** all UI text (buttons, instructions, error messages) appears in Russian.
2. **Given** the user's Telegram language is set to Romanian, **When** they open the Eye Gym Web App, **Then** all UI text appears in Romanian.
3. **Given** the user's Telegram language is set to an unsupported language (e.g., Spanish), **When** they open the Eye Gym Web App, **Then** all UI text appears in English as the fallback.
4. **Given** the app is running in Russian, **When** the user starts an exercise with voice guidance enabled, **Then** step instructions are read aloud in Russian.

---

### User Story 6 - Privacy Policy Access (Priority: P3)

As a privacy-conscious user, I access the Privacy Policy from the Settings screen via a footer link to understand how my data is handled. The policy clearly states that no personal data is collected or transmitted.

**Why this priority**: Transparency builds trust and complies with the constitution's Transparency principle. However, it's read-only content that doesn't block core functionality, making it P3.

**Independent Test**: Navigate to Settings, tap the "Privacy Policy" link, and verify it opens a static page in the Telegram browser with the required privacy statement.

**Acceptance Scenarios**:

1. **Given** the user is on the Settings screen, **When** they tap "Privacy Policy", **Then** a static page opens in the Telegram browser.
2. **Given** the Privacy Policy page is open, **When** the user reads it, **Then** it includes the statement: "Eye Gym Web App stores your progress and settings only on this device. We do not track, log, or share your activity."

---

### Edge Cases

- What happens when the user starts an exercise but closes the Web App mid-session? (Expected: Progress is lost; user can restart the exercise from the list.)
- What happens when the user enters a premium code with extra spaces or lowercase letters? (Expected: Code validation trims whitespace and normalizes to uppercase before checking.)
- What happens when the user's Telegram language changes while the app is running? (Expected: Language updates on next app launch, not mid-session.)
- What happens when the user enables reminders but the bot is blocked by Telegram? (Expected: Settings should warn: "Make sure you've started @EyeGymBot to receive reminders".)
- What happens when the user taps "Pause" during an exercise and leaves the app for hours? (Expected: Session state is not persisted; returning to the app shows the exercise list, not the paused session.)
- What happens when the user tries to unlock premium with a code while offline? (Expected: Error message: "No connection. Check your internet and try again".)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Web App MUST display an exercise list screen upon launch within 5 seconds, showing at least 10 free exercises and 3–5 premium exercises with clear visual distinction (lock icon and "Premium" badge for premium content).
- **FR-002**: Each exercise card MUST display: exercise title, estimated duration (e.g., "1 min"), difficulty level (beginner/intermediate), and whether audio guidance is available.
- **FR-003**: Users MUST be able to tap any free exercise to launch a full-screen, distraction-free session screen with step-by-step instructions.
- **FR-004**: The exercise session screen MUST display: current step instruction in large, readable text; visual progress indicators (timer bar and step counter like "Step 2 of 5"); and controls for Pause, Skip, and Done.
- **FR-005**: The exercise session screen MUST support optional voice guidance that reads each step instruction aloud if the global voice guidance setting is enabled.
- **FR-006**: After completing an exercise, the Web App MUST display a completion message ("✅ Done!") with options to "Repeat" the exercise or return to the exercise list.
- **FR-007**: The Web App MUST provide a Settings screen accessible via a ⚙️ icon, offering: toggle for "Enable reminders" (off by default), dropdown to select reminder interval (2h, 4h, 6h) when reminders are enabled, toggle for global "Voice guidance" (on/off), button to "Enter Premium Code", and link to "Privacy Policy".
- **FR-008**: When the user enables reminders and selects an interval, the Web App MUST signal the main bot (via Telegram's data channel or deep link) to begin sending periodic push notifications at the chosen interval.
- **FR-009**: Reminder notifications sent by @EyeGymBot MUST include the text: "👁️ Time for a 1-min eye break! Tap to start →" and MUST open the Web App directly to the exercise list when tapped.
- **FR-010**: When the user disables reminders in Settings, the Web App MUST signal the bot to stop sending notifications immediately.
- **FR-011**: The Web App MUST provide a modal accessible via "Enter Premium Code" in Settings, with an input field for a 6-character code and an "Unlock" button.
- **FR-012**: When a user enters a valid premium code, the Web App MUST unlock all premium exercises permanently on the current device and display a success message: "Premium unlocked! 🎉".
- **FR-013**: When a user enters an invalid premium code, the Web App MUST display an error message: "Code not found. Check spelling or get one at t.me/EyeGymBot".
- **FR-014**: Premium unlock status MUST persist across app sessions on the same device using `localStorage`.
- **FR-015**: The Web App MUST detect the user's Telegram language from `WebApp.initDataUnsafe.user.language_code` and display all UI text in the detected language (English, Russian, or Romanian). If the detected language is not supported, the Web App MUST default to English.
- **FR-016**: All UI strings (buttons, instructions, error messages) MUST be externalized and available in English, Russian, and Romanian.
- **FR-017**: The Settings screen MUST include a "Privacy Policy" link that opens a static page in the Telegram browser stating: "Eye Gym Web App stores your progress and settings only on this device. We do not track, log, or share your activity."
- **FR-018**: The Web App MUST NOT collect, transmit, or log any personal user data except for user-opted-in reminder preferences communicated to @EyeGymBot.
- **FR-019**: Premium code validation MUST trim whitespace and normalize input to uppercase before checking validity.
- **FR-020**: When the user taps a premium exercise without unlocking premium, the Web App MUST display a message: "Unlock premium exercises by entering a code in Settings ⚙️" with a link to Settings.

### Constitution-derived Requirements (Eye Gym)

- **CR-001**: UI MUST use the Telegram Web App SDK for theming, alerts, and navigation.
- **CR-002**: The Web App MUST NOT include third-party analytics or telemetry scripts.
- **CR-003**: Language support MUST be limited to English, Russian, and Romanian; language detection MUST use `WebApp.initDataUnsafe.user.language_code` with English fallback.
- **CR-004**: Premium flows MUST use user-entered codes for unlocks and MUST navigate to external payment pages via `openLink()`; no in-app payments.
- **CR-005**: JS bundle size (gzipped) MUST be ≤ 120 KB; implementations MUST avoid external JS dependencies.

- **CR-006**: Voice guidance uses embedded audio for core phrases + the Web Speech API for scalability — zero network requests by default; the system is designed to work offline and without external speech services.

### Key Entities

- **Exercise**: Represents a single guided eye exercise. Attributes: unique ID, title (localized), description (localized), duration (in seconds), difficulty level (beginner/intermediate), steps (array of instruction objects), premium flag (boolean), audio guidance available (boolean).
- **Exercise Step**: Represents one step within an exercise. Attributes: step number, instruction text (localized), duration (in seconds), optional audio file reference (base64 or inline).
- **User Preferences**: Represents user settings stored locally. Attributes: reminders enabled (boolean), reminder interval (2h/4h/6h), voice guidance enabled (boolean), premium unlocked (boolean), selected language (en/ru/ro).
- **Premium Code**: Represents a 6-character alphanumeric code for unlocking premium content. Attributes: code string (uppercase), validity status (valid/invalid).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the app and start a free exercise within 5 seconds of launch (measured from app open to exercise session screen display).
- **SC-002**: 90% of users successfully complete at least one exercise session on their first use (measured by completion message display).
- **SC-003**: Users receive their first reminder notification within 10 seconds of the chosen interval passing after enabling reminders (measured from interval expiry to notification receipt).
- **SC-004**: Premium code entry succeeds on first attempt for valid codes 95% of the time (measured by unlock success rate excluding user typos).
- **SC-005**: The Web App loads and displays content in under 3 seconds on standard mobile connections (3G or better).
- **SC-006**: Users can identify premium vs. free exercises at a glance without reading instructions (measured by clear visual distinction in UI).
- **SC-007**: 100% of UI text displays in the user's Telegram language (English, Russian, or Romanian) or defaults to English for unsupported languages.
- **SC-008**: Zero third-party scripts or analytics libraries are loaded during any app session (verified by network traffic inspection).
- **SC-009**: The Privacy Policy is accessible from Settings and includes the required transparency statement 100% of the time.
- **SC-010**: Users can disable reminders and stop receiving notifications within one reminder interval (measured by notification cessation after disabling).

## Assumptions

- **Assumption 1**: The main Telegram bot (@EyeGymBot) already exists and can handle reminder scheduling and notification delivery via Telegram's Bot API.
- **Assumption 2**: Premium codes are generated and distributed externally (e.g., via Boosty, GitHub Sponsors, or manual fulfillment) and validated against a predefined list embedded in the Web App or fetched from a minimal API endpoint.
- **Assumption 3**: Users understand that closing the Web App mid-exercise will lose session progress (no persistent session state across app closes).
- **Assumption 4**: Voice guidance audio is pre-recorded and embedded as base64 or inline assets to meet the bundle size constraint.
- **Assumption 5**: The Web App does not require user accounts, authentication, or cloud sync; all state is local to the device.
- **Assumption 6**: Exercise content (titles, instructions, steps) is hardcoded or bundled with the app; no dynamic content fetching from a server.

## Out of Scope

The following features are explicitly excluded from this specification:

- User accounts, login, or authentication systems.
- Cloud sync of user progress or settings across devices.
- Analytics, telemetry, or usage tracking.
- Social sharing of exercise completions or achievements.
- In-app purchases or Telegram Payments integration.
- Camera access for eye tracking or posture detection.
- Custom exercise creation by users.
- Exercise history or progress tracking beyond the current session.
- Manual language switcher (auto-detection only).
- Dynamic exercise content fetching from a server.

