# Modularization Status

## Summary

Refactored the Word Memorizer PWA from a single monolithic `index.html` (~795 lines) into a modular file structure with separated CSS and JavaScript modules. No build tools introduced — plain `<script>` tags with global `window` functions.

## Completed

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `css/styles.css` | All CSS extracted from inline `<style>` block | 76 |
| `js/storage.js` | Shared state, localStorage helpers, utility functions, legacy migration | 39 |
| `js/sm2.js` | SM-2 spaced repetition algorithm (computeSM2, applyFlashcardSM2, applyWritingSM2) | 51 |
| `js/speech.js` | Text-to-speech (speakWord, speakBtn) | 14 |
| `js/celebration.js` | "Good job" rain animation (showGoodJob) | 43 |
| `js/user.js` | User CRUD (renderUserList, createUser, deleteUser, selectUser, switchUser) | 64 |
| `js/words.js` | Word management (addWord, bulkAdd, fetchDefinition, importFile, etc.) | 142 |
| `js/review.js` | Flashcard + writing review (startSession, showCard, flipCard, markCard, etc.) | 163 |
| `js/stats.js` | Statistics (renderStats, resetProgress, deleteAllWords) | 30 |
| `js/settings.js` | MW API key (getMWKey, saveMWKey) | 16 |
| `js/export.js` | Download/restore words (downloadWords, restoreWords) | 44 |
| `js/ui.js` | View switching + word list rendering (showView, renderList) | 35 |
| `js/init.js` | App initialization (calls migrateLegacy + renderUserList) | 5 |

### index.html Changes

- Removed entire `<style>` block → replaced with `<link rel="stylesheet" href="css/styles.css">`
- Removed entire `<script>` block → replaced with 12 `<script src="js/...">` tags in dependency order
- Preserved all HTML markup, element IDs, class names, inline `style` attributes, and PWA meta tags

### Script Load Order (dependency chain)

```
storage.js → sm2.js → speech.js → celebration.js → user.js → words.js → review.js → stats.js → settings.js → export.js → ui.js → init.js
```

## Known Issue (FIXED)

- `js/ui.js` was previously empty due to a file write failure. It has been recreated with the correct content (`showView` and `renderList` functions).

### Test Suite (Tasks 8, 9, 10)

Property-based tests (using `fast-check`) and smoke/integration tests are now complete.

| File | Tests | Purpose |
|------|-------|---------|
| `tests/pbt/sm2.test.mjs` | 4 properties | SM-2 computation correctness + default values invariant |
| `tests/pbt/stats.test.mjs` | 5 properties | Stats computation correctness |
| `tests/pbt/export.test.mjs` | 2 properties | JSON export/import round-trip fidelity |
| `tests/pbt/storage.test.mjs` | 3 properties | User storage saveUsers/getUsers round-trip |
| `tests/pbt/smoke.test.mjs` | 14 tests | File structure, no inline blocks, script order, PWA tags, global function availability |
| `tests/pbt/run_all.mjs` | — | Runner that executes all PBT + smoke suites |

Run all tests: `node tests/pbt/run_all.mjs`

## Remaining / Not Done

1. **Manual verification** — User should re-download the full project folder and test:
   - Open `index.html` from the project root (all `js/` and `css/` files must be alongside it)
   - Or serve with `python3 -m http.server 8000` and open `http://localhost:8000`
   - Verify: create user, add words, review (flashcard + writing), stats, settings, export/import

## How to Run

The app requires the full folder structure (not just `index.html` alone):

```
project-root/
├── index.html
├── manifest.json
├── css/
│   └── styles.css
├── js/
│   ├── storage.js
│   ├── sm2.js
│   ├── speech.js
│   ├── celebration.js
│   ├── user.js
│   ├── words.js
│   ├── review.js
│   ├── stats.js
│   ├── settings.js
│   ├── export.js
│   ├── ui.js
│   └── init.js
└── (icons, docs, etc.)
```

Open `index.html` directly in a browser (file:// works) or serve via HTTP server.
