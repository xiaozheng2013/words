# Installing Word Memorizer on Your iPhone

Word Memorizer is a **Progressive Web App (PWA)**. You don't need the App Store — you install it directly from Safari and it works like a native app with its own icon on your home screen.

---

## Prerequisites

- iPhone running **iOS 16.4 or later** (recommended; PWA install has been supported since iOS 11.3, but standalone mode works best on 16.4+)
- The app must be **hosted over HTTPS** — it cannot be installed as a PWA from a local file. See hosting options below if you haven't deployed it yet.

---

## Step 1 — Host the App (if not already hosted)

You need the app accessible via a public HTTPS URL. Pick any option:

### Option A: GitHub Pages (free, easiest)
1. Push the `memorize_words/` folder contents to a GitHub repository.
2. Go to **Settings → Pages** in your repo.
3. Under "Source", select **Deploy from a branch**, choose `main` (or `master`), and set the folder to `/root` (or `/docs` if you moved files there).
4. Click **Save**. GitHub will give you a URL like `https://<your-username>.github.io/<repo-name>/`.

### Option B: Netlify (free, drag-and-drop)
1. Go to [netlify.com](https://netlify.com) and sign in.
2. From the dashboard, drag the entire `memorize_words/` folder onto the deploy drop zone.
3. Netlify instantly gives you a URL like `https://<random-name>.netlify.app`.

### Option C: AWS S3 + CloudFront
1. Create an S3 bucket, enable **Static website hosting**, and upload all files from `memorize_words/`.
2. Create a CloudFront distribution pointing to the S3 bucket with HTTPS enabled.
3. Use the CloudFront domain as your URL.

> **Icon files:** The manifest references `icon-192.png` and `icon-512.png`. Create or place these image files in the same folder as `index.html` before deploying. Without them the app still works, but the home screen icon will be a generic Safari screenshot.

---

## Step 2 — Open the App in Safari on Your iPhone

> ⚠️ **Must use Safari.** Chrome, Firefox, and other browsers on iOS do not support "Add to Home Screen" as a PWA.

1. Open the **Safari** browser on your iPhone.
2. Navigate to your hosted URL (e.g. `https://yourname.github.io/word-memorizer/`).
3. Wait for the page to fully load.

---

## Step 3 — Add to Home Screen

1. Tap the **Share** button at the bottom of the Safari screen (the box with an arrow pointing up: **⬆**).
2. Scroll down in the share sheet and tap **"Add to Home Screen"**.
3. You'll see a preview with the app name **"WordMem"** (from the manifest). You can rename it here if you like.
4. Tap **"Add"** in the top-right corner.

---

## Step 4 — Launch from Home Screen

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

**Data is lost after reinstalling**
- `localStorage` is tied to the browser origin. If you change your hosting URL, existing data will not carry over. Export your words via the file import/export feature before switching URLs.

**Icons show as a generic screenshot**
- Add `icon-192.png` and `icon-512.png` to your deployment. Any 192×192 and 512×512 PNG images will work. You can generate them from any image using [realfavicongenerator.net](https://realfavicongenerator.net).
