# Eye Gym Web App 👁️

A Telegram Web App that helps users reduce digital eye strain through guided eye exercises.

## Features

- **Instant Exercise Access**: 10+ free exercises, 3-5 premium exercises
- **Guided Sessions**: Step-by-step instructions with optional voice guidance
- **Daily Reminders**: Opt-in reminders via @EyeGymBot
- **Multilingual**: Automatic language detection (EN/RU/RO)
- **Privacy-First**: No telemetry, localStorage only
- **Lightweight**: ≤120 KB gzipped bundle

## Quick Start

See [specs/001-eye-gym-web-app/quickstart.md](specs/001-eye-gym-web-app/quickstart.md) for:
- Local development setup
- Testing in Telegram WebView
- Deployment to GitHub Pages
- Testing checklist

## Technical Stack

- **Language**: Vanilla JavaScript ES6 modules (no build step)
- **Framework**: Telegram WebApp SDK v7+
- **Storage**: localStorage only (no backend)
- **Styling**: Plain CSS with CSS variables
- **Bundle**: ≤120 KB gzipped

## Development

```bash
# Start local dev server
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

## Project Structure

```
├── index.html           # Main app entry point
├── privacy.html         # Privacy policy page
├── js/                  # JavaScript modules
│   ├── app.js          # App initialization
│   ├── telegram.js     # Telegram SDK wrapper
│   ├── i18n.js         # Internationalization
│   ├── storage.js      # localStorage wrapper
│   ├── exercises.js    # Exercise list & loading
│   ├── session.js      # Exercise session controller
│   └── settings.js     # Settings screen
├── css/                 # Stylesheets
│   ├── main.css        # Base styles & variables
│   ├── exercises.css   # Exercise list styles
│   └── session.css     # Session screen styles
├── locales/             # Translations (embedded inline)
│   ├── en.json
│   ├── ru.json
│   └── ro.json
├── exercises/           # Exercise data
│   ├── free.json       # Free exercises
│   └── premium.json    # Premium exercises
└── assets/              # Static assets
    └── icons/          # Inline SVG icons
```

## Constitution

This project follows the [Eye Gym Constitution](.specify/memory/constitution.md) with 7 core principles:
1. Telegram-Native UX
2. Privacy by Design
3. Multilingual Compliance
4. Monetization Boundaries
5. Reliability & Simplicity
6. User Autonomy
7. Transparency

## License

MIT License - See LICENSE file for details

## Contact

- Telegram Bot: @EyeGymBot
- Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/eye-gym-app/issues)
