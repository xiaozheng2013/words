# Implementation Plan: Modular Codebase

## Overview

Refactor the Word Memorizer PWA from a single monolithic `index.html` into a clean file structure with separated CSS (`css/styles.css`) and JavaScript modules (`js/*.js`). No build tools — plain `<script>` tags with global `window` functions, preserving all existing behavior.

## Tasks

- [x] 1. Create directory structure and extract CSS
  - [x] 1.1 Create `css/styles.css` with all styles extracted from the `<style>` block in `index.html`
    - Copy the entire contents of the `<style>` block (including `rain-word` animation keyframes) into `css/styles.css`
    - _Requirements: 1.1, 1.3, 1.4, 3.2_

  - [x] 1.2 Create `js/storage.js` — Storage_Manager foundation module
    - Declare shared mutable state on `window`: `currentUser`, `words`, `session`, `sessionIdx`, `flipped`, `correctAnswersInSession`, `reviewMode`, `writingAttempts`, `writingRevealed`
    - Implement utility functions: `today()`, `daysFromNow(d)`, `storageKey()`
    - Implement localStorage helpers: `getUsers()`, `saveUsers(u)`, `save()`
    - Implement `migrateLegacy()` function (moves `wm_words` → `wm_words_default`)
    - _Requirements: 2.4, 7.1, 7.2_

  - [x] 1.3 Create `js/sm2.js` — SM2_Engine module
    - Implement `computeSM2(interval, easeFactor, known, fullCredit)` returning `{ interval, easeFactor, nextReview, known }`
    - Implement `applyFlashcardSM2(wordObj, known)` that mutates word in `words[]`
    - Implement `applyWritingSM2(wordObj, known, fullCredit)` that mutates word in `words[]`
    - All functions exposed on `window`
    - _Requirements: 2.4, 4.3, 4.4_

- [x] 2. Checkpoint — Verify foundation modules
  - Ensure `css/styles.css`, `js/storage.js`, and `js/sm2.js` are created with correct content. Ask the user if questions arise.

- [x] 3. Extract standalone utility modules
  - [x] 3.1 Create `js/speech.js` — Speech_Module
    - Implement `speakWord(word)` using `SpeechSynthesisUtterance` with `lang='en-US'`
    - Implement `speakBtn(word)` returning the HTML string for the 🔊 button
    - _Requirements: 2.4, 9.1, 9.2_

  - [x] 3.2 Create `js/celebration.js` — Celebration_Module
    - Implement `showGoodJob()` that creates rain animation elements (triggered every 10 correct answers)
    - _Requirements: 2.4, 4.8_

  - [x] 3.3 Create `js/settings.js` — Settings_Manager
    - Implement `getMWKey()` reading from localStorage key `mw_api_key`
    - Implement `saveMWKey()` saving API key from the input element
    - _Requirements: 2.4, 10.3_

  - [x] 3.4 Create `js/export.js` — Export_Manager
    - Implement `downloadWords()` serializing words as JSON and triggering download
    - Implement `restoreWords(e)` parsing uploaded JSON and restoring word list
    - _Requirements: 2.4, 4.6_

- [x] 4. Extract feature modules
  - [x] 4.1 Create `js/user.js` — User_Manager
    - Implement `renderUserList()`, `createUser()`, `deleteUser(name)`, `selectUser(name)`, `switchUser()`
    - Depends on: `storage.js`
    - _Requirements: 2.4, 4.1, 8.1, 8.2_

  - [x] 4.2 Create `js/words.js` — Word_Manager
    - Implement `addWord()`, `bulkAdd()`, `fetchDefinition(w)`, `importFile(e)`, `renderNotFound(list)`, `addManually(w)`, `ignoreNotFound(w)`, `deleteWord(i)`
    - Depends on: `storage.js`, `sm2.js`, `settings.js`
    - _Requirements: 2.4, 4.2, 10.1, 10.2_

  - [x] 4.3 Create `js/review.js` — Review_Controller
    - Implement `setReviewMode(mode)`, `startSession(all)`, `showCard()`, `flipCard()`, `markCard(known)`, `renderWritingCard(w, feedback, color)`, `renderWritingReveal(w, correct)`, `submitWriting()`, `advanceWriting()`, `buildHint(word, lettersRevealed)`
    - Register keyboard event listener (Space/ArrowUp/ArrowDown to flip, ArrowLeft/ArrowRight for know/don't know) only active in flashcard mode
    - Depends on: `storage.js`, `sm2.js`, `speech.js`, `celebration.js`, `words.js`
    - _Requirements: 2.4, 4.3, 4.4, 6.1, 6.2_

  - [x] 4.4 Create `js/stats.js` — Stats_Renderer
    - Implement `renderStats()`, `resetProgress()`, `deleteAllWords()`
    - Depends on: `storage.js`
    - _Requirements: 2.4, 4.5, 4.7_

- [x] 5. Checkpoint — Verify all JS modules
  - Ensure all 10 JS module files exist in `js/` with correct function signatures. Ask the user if questions arise.

- [x] 6. Create UI controller and initialization, update index.html
  - [x] 6.1 Create `js/ui.js` — UI_Controller
    - Implement `showView(name)` handling view switching and triggering appropriate renders
    - Implement `renderList()` for the word list view
    - Depends on: all other modules
    - _Requirements: 2.4, 8.1, 8.2_

  - [x] 6.2 Create `js/init.js` — Initialization script
    - Call `migrateLegacy()` immediately
    - Call `renderUserList()` to set up the user selection screen
    - _Requirements: 2.4, 7.1, 11.2_

  - [x] 6.3 Update `index.html` to reference external files
    - Remove the entire `<style>` block and add `<link rel="stylesheet" href="css/styles.css">`
    - Remove the entire `<script>` block and add `<script>` tags for each JS file in dependency order: storage.js → sm2.js → speech.js → celebration.js → user.js → words.js → review.js → stats.js → settings.js → export.js → ui.js → init.js
    - Preserve all HTML markup, element IDs, class names, inline `style` attributes, and PWA meta tags
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.3, 5.1, 5.2, 5.4, 11.1, 12.1, 12.2, 12.3_

- [x] 7. Checkpoint — Verify app loads and functions
  - Ensure the app loads without errors, all views render correctly, and existing Puppeteer tests pass. Ask the user if questions arise.

- [x] 8. Write property-based tests for SM-2 engine
  - [x] 8.1 Set up fast-check dependency and test infrastructure
    - Install `fast-check` as a dev dependency
    - Create `tests/pbt/` directory
    - _Requirements: 4.3, 4.4_

  - [x] 8.2 Write property test: SM-2 computation correctness
    - **Property 1: SM-2 computation correctness**
    - **Validates: Requirements 4.3, 4.4**
    - File: `tests/pbt/sm2.test.mjs`
    - Generate random (interval, easeFactor, known, fullCredit) tuples and verify output matches SM-2 rules

  - [x] 8.3 Write property test: SM-2 default values invariant
    - **Property 2: SM-2 default values invariant**
    - **Validates: Requirements 4.2, 4.7, 7.2**
    - File: `tests/pbt/sm2.test.mjs`
    - Generate random word objects and verify defaults are applied correctly after init/reset/patch

- [x] 9. Write property-based tests for stats and data round-trips
  - [x] 9.1 Write property test: Stats computation correctness
    - **Property 3: Stats computation correctness**
    - **Validates: Requirements 4.5**
    - File: `tests/pbt/stats.test.mjs`
    - Generate random arrays of word objects and verify stats metrics match expected formulas

  - [x] 9.2 Write property test: Export/import round-trip
    - **Property 4: Export/import round-trip**
    - **Validates: Requirements 4.6**
    - File: `tests/pbt/export.test.mjs`
    - Generate random word arrays and verify JSON serialize/parse produces deep equality

  - [x] 9.3 Write property test: User storage round-trip
    - **Property 5: User storage round-trip**
    - **Validates: Requirements 4.1**
    - File: `tests/pbt/storage.test.mjs`
    - Generate random lists of unique usernames and verify saveUsers/getUsers round-trip

- [x] 10. Write smoke and integration tests
  - [x] 10.1 Write smoke test verifying file structure and script loading
    - Verify `index.html` has no `<style>` or `<script>` blocks
    - Verify all expected `.js` files exist in `js/`
    - Verify `css/styles.css` exists and contains key selectors
    - Verify script tags appear in correct dependency order
    - _Requirements: 1.3, 2.2, 3.1, 3.2, 11.1_

  - [x] 10.2 Write integration test verifying global function availability
    - Load all scripts and verify every `onclick`-referenced function exists on `window`
    - _Requirements: 2.3, 8.1, 8.2_

- [x] 11. Final checkpoint
  - Ensure all tests pass, no 404 errors when serving the app, and PWA meta tags are preserved. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The app uses plain `<script>` tags (not ES modules) to maintain `onclick` handler compatibility
- No build tools are introduced — all files served directly
