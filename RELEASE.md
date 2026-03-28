# Release Notes

## v1.0.0 — Initial Release

### Summary
First stable release of Word Memorizer, a self-contained, offline flashcard app for vocabulary learning using the SM-2 spaced repetition algorithm.

### Features
- SM-2 spaced repetition algorithm for smart review scheduling
- Multi-user support with isolated word lists and progress per user
- Flashcard review sessions (due-only or review-all mode)
- Manual word entry and bulk import from pipe-separated text files
- Stats screen: total words, due today, mature count, mastery %, next review date
- Word list with status badges (Mature / Due / Upcoming) and per-word delete
- Reset all progress or delete all words per user
- Keyboard shortcuts on the Review screen (Space/↑/↓ to flip, →/← to rate)
- Fun rain animation every 10 correct answers
- Legacy single-user data auto-migrated to a user named `default`

### Bug Fixes
- Fixed: switching users did not reset the active tab back to Stats (see BUGFIX_LOG.md)

### Test Infrastructure
- Added `test_switch_user.html` — browser-based integration test for user-switch tab reset
- Added `run_tests.mjs` — headless Puppeteer runner for automated testing (`node run_tests.mjs`)

### Notes
- No backend or external dependencies; all data stored in `localStorage`
- `node_modules/` and `package-lock.json` excluded via `.gitignore`
