# Installing Word Memorizer on Your iPhone

Word Memorizer is a **Progressive Web App (PWA)**. You don't need the App Store — you install it directly from Safari and it works like a native app with its own icon on your home screen.

---

## Prerequisites

- iPhone running **iOS 16.4 or later** (recommended; PWA install has been supported since iOS 11.3, but standalone mode works best on 16.4+)
- Use **Safari** on your iPhone — Chrome and Firefox on iOS do not support PWA installation.

---

## The App URL

The app is hosted at:

> **https://xiaozheng2013.github.io/words/**

---

## Step 1 — Open the App in Safari on Your iPhone

> ⚠️ **Must use Safari.** Chrome, Firefox, and other browsers on iOS do not support "Add to Home Screen" as a PWA.

1. Open the **Safari** browser on your iPhone.
2. Navigate to **https://xiaozheng2013.github.io/words/**
3. Wait for the page to fully load.

---

## Step 2 — Add to Home Screen

1. Tap the **Share** button at the bottom of the Safari screen (the box with an arrow pointing up: **⬆**).
2. Scroll down in the share sheet and tap **"Add to Home Screen"**.
3. You'll see a preview with the app name **"WordMem"** (from the manifest). You can rename it here if you like.
4. Tap **"Add"** in the top-right corner.

---

## Step 3 — Launch from Home Screen

- Find the **WordMem** icon on your home screen (it may be on a new page).
- Tap it to launch.
- The app opens **fullscreen** with no Safari address bar or browser chrome — it looks and feels like a native app.

---

## What Works on iPhone

| Feature | Works? | Notes |
|---|---|---|
| Flashcard review | ✅ | Tap card to flip |
| Add words manually | ✅ | |
| Bulk add with auto-fetch | ✅ | Requires internet |
| Import from .txt file | ✅ | Use Files app to pick a file |
| Download words (JSON backup) | ✅ | Stats screen → ⬇️ Download Words |
| Restore words from backup | ✅ | Stats screen → ⬆️ Restore Words |
| Multi-user support | ✅ | |
| Stats screen | ✅ | |
| Rain animation | ✅ | |
| Keyboard shortcuts | ❌ | No physical keyboard; use buttons instead |
| Offline use | ✅ | All data in localStorage; no internet needed except for bulk add |

---

## Troubleshooting

**"Add to Home Screen" option is missing**
- Make sure you are using **Safari**, not Chrome or another browser.
- Make sure the URL is **HTTPS**, not HTTP.

**App opens in Safari instead of fullscreen**
- Delete the home screen icon and re-add it following Step 3 again.
- Ensure the `manifest.json` file is being served correctly (check browser DevTools → Application → Manifest if on desktop).

**Need to reinstall the app (e.g. to get a new version)**
- Your word data will be lost when you delete the PWA. Before deleting, back up your data:
  1. Open the installed PWA → Stats → tap **"⬇️ Download Words"** to save a JSON backup.
  2. Delete the PWA and reinstall from **https://xiaozheng2013.github.io/words/**
  3. After reinstalling, go to Stats → **"⬆️ Restore Words"** and pick the downloaded JSON file.

**Data is different between iPhone and desktop**
- `localStorage` is isolated per device and browser. Use **"⬇️ Download Words"** on one device and **"⬆️ Restore Words"** on the other to sync your data manually.

**Icons show as a generic screenshot**
- Add `icon-192.png` and `icon-512.png` to your deployment. Any 192×192 and 512×512 PNG images will work. You can generate them from any image using [realfavicongenerator.net](https://realfavicongenerator.net).
