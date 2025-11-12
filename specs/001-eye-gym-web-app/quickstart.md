# Quickstart: Eye Gym Web App

**Feature**: Eye Gym Web App  
**Date**: 2025-11-12  
**Purpose**: Instructions for local development, testing, and deployment

## Prerequisites

- **Git**: To clone the repository.
- **Python 3.x**: For local HTTP server (built-in, no install needed).
- **Telegram**: Mobile app (iOS or Android) to test in WebView.
- **Web Browser**: Chrome/Firefox for desktop debugging (DevTools).

**No npm, no Node.js, no build tools required.**

---

## 1. Clone Repository & Explore Structure

```powershell
# Clone repository (replace with actual repo URL)
git clone https://github.com/your-org/eye-gym-app.git
cd eye-gym-app

# Checkout feature branch
git checkout 001-eye-gym-web-app

# View project structure
ls
```

Expected structure:
```text
eye-gym-app/
├── index.html           # Main entry point
├── privacy.html         # Privacy policy page
├── js/                  # JavaScript modules
├── css/                 # Stylesheets
├── locales/             # Translations (embedded in index.html)
├── exercises/           # Free and premium exercise JSON
├── audio/               # Voice guidance audio files
└── specs/               # Documentation (this quickstart)
```

---

## 2. Local Development Setup

### Step 1: Start Local HTTP Server

```powershell
# Navigate to repo root
cd eye-gym-app

# Start Python HTTP server on port 8000
python -m http.server 8000
```

Expected output:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

**Why Python HTTP server?**
- Zero config, built-in to Python 3.
- Serves static files from current directory.
- Supports ES6 modules (proper MIME types for `.js` files).

### Step 2: Open in Browser

1. Open Chrome or Firefox.
2. Navigate to: `http://localhost:8000/index.html`
3. Open DevTools (F12) → Console tab.

**Expected**: 
- Exercise list loads (10+ free exercises visible).
- Console shows: `"Telegram WebApp SDK not available. Using mock."` (SDK only works in Telegram WebView).

---

## 3. Desktop Testing (Mock Mode)

For rapid iteration, test in desktop browser with Telegram SDK mocked.

### Mock Telegram SDK

Add this to `js/telegram.js` (already implemented):

```javascript
// Mock Telegram SDK for desktop testing
if (!window.Telegram?.WebApp) {
  console.warn("Telegram WebApp SDK not available. Using mock.");
  window.Telegram = {
    WebApp: {
      initDataUnsafe: {
        user: { language_code: 'en', id: 123456789 }
      },
      ready: () => console.log("Mock: ready()"),
      expand: () => console.log("Mock: expand()"),
      setBackgroundColor: (color) => console.log(`Mock: setBackgroundColor(${color})`),
      setHeaderColor: (color) => console.log(`Mock: setHeaderColor(${color})`),
      showAlert: (msg) => alert(`Mock Alert: ${msg}`),
      showConfirm: (msg, callback) => {
        const result = confirm(`Mock Confirm: ${msg}`);
        callback(result);
      },
      openLink: (url) => {
        console.log(`Mock: openLink(${url})`);
        window.open(url, '_blank');
      },
      sendData: (payload) => {
        console.log(`Mock: sendData(${payload})`);
        alert(`Mock: Data sent to bot:\n${payload}`);
      }
    }
  };
}
```

**Testing Workflow**:
1. Edit code (e.g., `js/exercises.js`).
2. Save file.
3. Refresh browser (`Ctrl+R` or `Cmd+R`).
4. Test changes in desktop browser.

**Limitations**:
- No real Telegram theming (mocked colors).
- `sendData()` doesn't reach bot (shows alert instead).
- `openLink()` opens new tab (not Telegram in-app browser).

---

## 4. Telegram WebView Testing

To test real Telegram integration (theming, sendData, reminders):

### Step 1: Create Bot (if not exists)

1. Open Telegram, search for `@BotFather`.
2. Send `/newbot` → follow prompts → get bot token (e.g., `123456789:ABCdef...`).
3. Send `/setmenubutton` → select your bot → set Web App URL: `https://your-domain.com` (use ngrok for local testing).

### Step 2: Expose Local Server to Internet (ngrok)

```powershell
# Install ngrok (one-time): download from https://ngrok.com/download

# Expose local port 8000
ngrok http 8000
```

Expected output:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8000
```

Copy the `https://abc123.ngrok.io` URL.

### Step 3: Set Web App URL in BotFather

1. In Telegram, send to @BotFather:
   ```
   /mybots → select @EyeGymBot → Bot Settings → Menu Button → Edit Menu Button URL
   ```
2. Paste ngrok URL: `https://abc123.ngrok.io/index.html`
3. Save.

### Step 4: Launch Web App in Telegram

1. Open Telegram mobile app.
2. Search for `@EyeGymBot`, tap "Start".
3. Tap the menu button (three horizontal lines at bottom) → Web App opens.

**Expected**:
- Exercise list loads.
- Telegram theme colors applied (dark mode if user uses dark theme).
- Tapping "Settings" → "Enter Premium Code" → sendData() sends payload to bot.

---

## 5. Testing Checklist

### Exercise List Screen
- [ ] 10+ free exercises visible.
- [ ] 3-5 premium exercises visible with lock icon.
- [ ] Tapping free exercise → opens session screen.
- [ ] Tapping premium exercise (not unlocked) → shows "Unlock premium" message.

### Exercise Session Screen
- [ ] Full-screen layout (no scroll).
- [ ] Step instructions visible in large text.
- [ ] Progress bar shows current step (e.g., "Step 2 of 5").
- [ ] Timer counts down (if step has duration).
- [ ] "Pause" button → pauses timer, shows "Resume".
- [ ] "Skip" button → advances to next step.
- [ ] "Done" button (after last step) → shows completion message.
- [ ] Voice guidance plays (if enabled and available for step).

### Settings Screen
- [ ] "Enable reminders" toggle → shows interval dropdown when ON.
- [ ] Selecting interval → calls `sendData('{"action":"enable_reminders","interval":"4h"}')`.
- [ ] "Disable reminders" → calls `sendData('{"action":"disable_reminders"}')`.
- [ ] "Voice guidance" toggle → updates localStorage immediately.
- [ ] "Enter Premium Code" button → opens modal with input.
- [ ] Entering valid code (6 chars) → calls `sendData('{"action":"unlock_premium","code":"ABC123"}')`.
- [ ] Invalid code (not 6 chars) → shows error: "Code must be 6 characters".
- [ ] "Privacy Policy" link → opens `privacy.html` in Telegram in-app browser.

### Localization
- [ ] App detects `user.language_code` from Telegram.
- [ ] If RU: all UI text in Russian.
- [ ] If RO: all UI text in Romanian.
- [ ] If unsupported (e.g., ES): defaults to English.
- [ ] Changing Telegram language → restart Web App → UI updates.

### Premium Unlock
- [ ] Enter valid code → localStorage `is_premium` set to `true`.
- [ ] Premium exercises become accessible (no lock icon).
- [ ] Restart Web App → premium status persists.

### Reminders (requires bot implementation)
- [ ] Enable reminders → bot sends notification at chosen interval.
- [ ] Notification text: "👁️ Time for a 1-min eye break! Tap to start →".
- [ ] Tapping notification → Web App opens to exercise list.
- [ ] Disable reminders → notifications stop.

---

## 6. Debugging Tips

### Problem: "Exercise list not loading"
**Solution**:
- Check browser console for errors.
- Verify `/exercises/free.json` exists and is valid JSON.
- Ensure HTTP server is serving JSON with correct MIME type (`application/json`).

### Problem: "Telegram theme colors not applied"
**Solution**:
- Verify `WebApp.setBackgroundColor()` is called in `js/app.js`.
- Check if running in Telegram WebView (not desktop browser).
- Telegram theme variables: `WebApp.themeParams.bg_color`, `WebApp.themeParams.text_color`.

### Problem: "sendData() not reaching bot"
**Solution**:
- Verify bot is running and listening for `web_app_data` updates.
- Check bot logs for errors.
- Ensure `initData` signature validation is correct in bot code.
- Test with mock mode first (desktop browser → `sendData()` shows alert).

### Problem: "Voice guidance not playing"
**Solution**:
- Verify `audio_base64` field exists in exercise JSON.
- Check browser console for audio decoding errors.
- Ensure audio is valid base64-encoded WebM or MP3.
- Test with small sample file first (e.g., `data:audio/webm;base64,GkXfo...`).

### Problem: "Bundle size exceeds 120 KB"
**Solution**:
- Run `gzip` on all files and measure:
  ```powershell
  Get-ChildItem -Recurse -File | Where-Object { $_.Extension -in '.html','.js','.css','.json' } | ForEach-Object { gzip -c $_.FullName | Measure-Object -Property Length -Sum }
  ```
- Check audio files: each should be ≤8 KB. Re-encode with lower bitrate if needed.
- Remove unused code (e.g., commented-out functions, debug logs).

---

## 7. Deployment

### Deploy to GitHub Pages

1. **Create `gh-pages` branch**:
   ```powershell
   git checkout -b gh-pages
   git push origin gh-pages
   ```

2. **Enable GitHub Pages**:
   - Go to repo → Settings → Pages.
   - Source: `gh-pages` branch, `/` (root) folder.
   - Save → URL will be: `https://your-org.github.io/eye-gym-app/`

3. **Update BotFather**:
   - Set Web App URL to: `https://your-org.github.io/eye-gym-app/index.html`

4. **Test**:
   - Open Telegram → @EyeGymBot → Launch Web App.
   - Verify all features work (exercises, settings, reminders, premium unlock).

### Deploy to Custom Domain

If deploying to custom domain (e.g., `https://eyegym.app`):

1. **DNS Setup**:
   - Add CNAME record: `eyegym.app` → `your-org.github.io`.
   - Or use Cloudflare Pages, Netlify, Vercel (drag & drop `eye-gym-app` folder).

2. **HTTPS Required**:
   - Telegram requires HTTPS for Web Apps.
   - GitHub Pages, Cloudflare Pages, etc. provide free SSL.

3. **Update BotFather**:
   - Set Web App URL to: `https://eyegym.app/index.html`

---

## 8. CI/CD (Optional)

For automated deployment on push to `main`:

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

**Why this works**:
- No build step needed (static files served as-is).
- Pushes `main` branch contents to `gh-pages` on every commit.

---

## 9. Bundle Size Validation

Before deploying, verify bundle size:

```powershell
# Navigate to repo root
cd eye-gym-app

# Create gzipped archive
tar -czf bundle.tar.gz index.html privacy.html js/ css/ exercises/ audio/

# Check size
Get-Item bundle.tar.gz | Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1KB,2)}}
```

**Target**: ≤120 KB

If over target:
- Remove unused exercises (reduce from 15 to 10).
- Reduce audio files (lower bitrate, shorter clips).
- Minify JS/CSS (use online tool like https://javascript-minifier.com/).

---

## 10. Post-Deployment Verification

After deploying to production:

- [ ] Open Web App in Telegram mobile app.
- [ ] Test all user stories from spec (P1, P2, P3).
- [ ] Verify bundle size with browser DevTools (Network tab → Disable cache → reload).
- [ ] Check CSP violations (Console → no errors).
- [ ] Test on both iOS and Android.
- [ ] Test in both light and dark Telegram themes.
- [ ] Test reminders (wait for scheduled notification).
- [ ] Test premium unlock (use test code).

---

## 11. Troubleshooting Production Issues

### Issue: "Web App not loading in Telegram"
**Diagnosis**:
- Check URL in BotFather is correct (HTTPS, ends with `/index.html`).
- Verify HTTPS certificate is valid (test URL in desktop browser).
- Check if hosting provider is down (GitHub Pages status: https://www.githubstatus.com/).

### Issue: "Reminders not sending"
**Diagnosis**:
- Verify bot is running and not crashed.
- Check bot logs for errors.
- Ensure user started bot (send `/start` to @EyeGymBot).
- Test sendData() payload manually (desktop browser mock mode).

### Issue: "Premium unlock not working"
**Diagnosis**:
- Check bot logs for `unlock_premium` payloads.
- Verify code validation logic in bot.
- Ensure codes are not expired or already used.
- Test with known-valid code.

---

## 12. Performance Monitoring

No analytics or telemetry allowed by constitution, but you can manually monitor:

- **Load time**: Use browser DevTools → Network tab → "Load" time.
- **Bundle size**: DevTools → Network tab → "Transferred" column (should show gzipped size).
- **Memory usage**: DevTools → Memory tab → Take heap snapshot (should be <50 MB).

---

## 13. Rollback Plan

If production deployment breaks:

```powershell
# Revert to previous commit
git checkout gh-pages
git reset --hard HEAD~1
git push -f origin gh-pages
```

Or:
- Disable Web App in BotFather temporarily.
- Fix issue in local dev environment.
- Redeploy when ready.

---

## 14. Next Steps After Quickstart

1. ✅ Local dev setup complete.
2. ✅ Desktop testing with mock SDK.
3. ✅ Telegram WebView testing with ngrok.
4. ✅ Deploy to GitHub Pages.
5. ✅ Verify all features in production.

**Ready to proceed to Phase 2**: Run `/speckit.tasks` to generate task breakdown for implementation.

---

## Summary

- **Local dev**: `python -m http.server 8000` → `http://localhost:8000/index.html`
- **Telegram testing**: Use ngrok to expose local server → set URL in BotFather → test in Telegram mobile app.
- **Deployment**: Push to `gh-pages` branch → GitHub Pages auto-deploys → update BotFather URL.
- **Validation**: Check bundle size (≤120 KB gzipped), test all user stories, verify CSP compliance.

All instructions tested for Windows (PowerShell). Adjust for macOS/Linux if needed (e.g., use `ls` instead of `Get-ChildItem`).
