# Eye Gym — standalone web product specification

## Goal
Create a standalone Eye Gym website based on the useful exercise experience of the Android application. The web product must not depend on Telegram or Google AI Studio.

## Public URL
Production target: `https://eye-gym.bacus.dev`.

## Initial release
The first production release is intentionally small: a polished responsive landing page in the Eye Gym visual theme with the product name and a clear Russian message `Уже скоро`.

The landing page is the deployment baseline. Once continuous deployment is proven, the functional website can be developed incrementally.

## Product direction
The future standalone website should reproduce and adapt the useful Eye Gym Android experience for the browser, including guided eye exercises and voice guidance. Android is the product/functionality reference; the web UX may be redesigned for browser and mobile use rather than copied pixel-for-pixel.

## Requirements for future development
- Mobile-first and responsive; desktop must also work well.
- Russian, Romanian and English localization is desirable as the product grows.
- Guided exercises should be simple to start and follow.
- Voice guidance should work in the browser without requiring the Android app.
- Avoid unnecessary backend infrastructure until a feature actually requires it.
- Prefer a static/PWA-capable architecture for portability and cheap hosting.
- No dependency on Telegram Web App APIs for the standalone site.
- No dependency on Gemini/AI Studio for core functionality.
- Preserve privacy: do not introduce analytics or collection of personal data without an explicit product decision and documentation.

## Deployment
The standalone site is hosted on the Bacus server and published automatically from GitHub using a repository-level self-hosted GitHub Actions runner.

Deployment target directory: `/srv/bacus/apps/eye-gym/site`.

The production artifact is the Vite `dist/` directory. A successful deployment replaces the contents of the target directory with the freshly built artifact.

## Development workflow
Changes can be authored from desktop or phone. A push to the repository's production branch triggers build and deployment automatically. Production must therefore never require manually copying changed frontend files to the server.

## Legacy documentation
Existing Telegram Web App / AI Studio documentation describes an earlier direction and is not authoritative for the new standalone website where it conflicts with this document.
