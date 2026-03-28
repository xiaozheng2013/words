# Word Memorizer — Specification

## Overview

A flashcard application for memorizing vocabulary using the **SM-2 spaced repetition algorithm**. All data is persisted locally on the client with no backend required. The app is self-contained with no external dependencies. Multiple users are supported, each with their own isolated word list and progress.

---

## Multi-User Support

The app supports multiple independent users on the same device.

- On load, a **User Selection screen** is shown before the main app.
- Users can be created (unique name required) or deleted (with confirmation; deletes all their data).
- Selecting a user loads their personal word list, enters the main app, and always lands on the **Stats** view regardless of which view was previously active.
- A **Switch User** button in the nav bar returns to the User Selection screen.
- Each user's data is stored under a separate `localStorage` key: `wm_words_<username>`.
- The user list is stored under `wm_users` in `localStorage`.
- **Legacy migration**: if a `wm_words` key exists from a single-user version, it is automatically migrated to a user named `default` on first load.

---

## Data Model

The application maintains a collection of word entries. Each entry has the following fields:

| Field        | Type    | Description                                                        |
|--------------|---------|--------------------------------------------------------------------|
| `word`       | string  | The vocabulary word. Must be unique (case-insensitive).            |
| `def`        | string  | Definition or notes. Optional, may be empty.                       |
| `known`      | boolean | Derived flag: `true` when `interval >= 21` (considered mature).    |
| `interval`   | integer | Current SM-2 review interval in days. Starts at `0`.              |
| `easeFactor` | float   | SM-2 ease factor. Starts at `2.5`, never drops below `1.3`.       |
| `nextReview` | date    | The next date this card is due for review. Midnight-normalized.    |

### Default values for a new word
```
interval   = 0
easeFactor = 2.5
nextReview = today (midnight)
known      = false
```

### Migration
On load, any existing entry missing SM-2 fields (`easeFactor`, `interval`, `nextReview`) must be patched with the above defaults.

---

## SM-2 Spaced Repetition Algorithm

Applied when the user rates a card after reviewing it.

### On "Know" (correct response):
```
if interval < 1:   interval = 1
elif interval < 2: interval = 2
else:              interval = round(interval × easeFactor)

easeFactor = max(1.3, easeFactor + 0.1)
```

### On "Don't Know" (incorrect response):
```
interval   = 1
easeFactor = max(1.3, easeFactor - 0.2)
```

### After either response:
```
nextReview = today + interval days   (midnight-normalized)
known      = (interval >= 21)
```

---

## Views / Screens

The app has four screens. Only one is visible at a time. The default screen on load is **Stats**.

| Screen    | Description                                      | Side effect on open    |
|-----------|--------------------------------------------------|------------------------|
| Stats     | Displays learning progress metrics               | Refresh stats          |
| Review    | Flashcard review session                         | Start a new session    |
| My Words  | Browsable list of all words                      | Refresh list           |
| Add Word  | Form to add words manually or via file import    | None                   |

---

## Features

### 1. Add Word (Manual)
- Requires a non-empty word; definition is optional.
- Reject duplicates with a warning (case-insensitive match).
- On success: save the new entry with default SM-2 values, clear the form, show a brief confirmation message.

### 2. Bulk Add with Auto-Fill
- A textarea accepts words separated by any whitespace (spaces, newlines, commas, or a mix).
- Duplicate words (case-insensitive, already in the user's list) are skipped silently.
- For each unique word, the app calls the [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/<word>) to fetch the first definition and first example sentence.
- The `def` field is stored as `<definition> | Example: <example>` (example omitted if absent).
- A live progress indicator shows `Fetching N / Total: <word>…` during the fetch loop.
- After completion, a summary is shown: words added, duplicates skipped, and not-found count.
- Words not found in the dictionary are collected and displayed in a **warning block**:
  - Each not-found word has two actions:
    - **Add Manually** — pre-fills the single-word form with that word and dismisses it from the list.
    - **Ignore** — dismisses the entry from the list.
  - The warning block disappears automatically when all not-found entries are resolved.

### 3. Import from Text File
- File format: one entry per line — `word|definition` (pipe-separated). Definition is optional.
- Strip trailing numeric suffixes from the word part (e.g. `"apple 3"` → `"apple"`).
- Skip duplicates silently (case-insensitive).
- After import: display a summary of how many words were added and how many were skipped. Reset the file input.

### 3. Review (Flashcard Session)

#### Starting a session
- Default mode: only include cards where `nextReview <= today` (due cards).
- "Review All" mode: include all cards regardless of due date.
- Shuffle the pool randomly at the start of each session.

#### Showing a card
- Display the word and a "tap to reveal" prompt.
- Show a progress counter: current position out of total cards in session.
- If the word collection is empty: show an empty-state message.
- If the session is complete: show a completion message and the next upcoming review date.

#### Flipping a card
- Triggered by tapping/clicking the card, or via keyboard shortcut.
- Reveals the definition beneath the word.
- A card can only be flipped once per display (no toggling back).

#### Rating a card
- Two options: "Know" or "Don't Know".
- Apply the SM-2 algorithm to the word's persistent record (matched by word string).
- Persist the updated record, then advance to the next card.
- Every 10 correct ("Know") answers within a session, a rain animation triggers: 15 items fall down the screen from random positions. Each item is randomly either a car brand logo (Tesla, BMW, Mercedes-Benz, Audi, Porsche, Ferrari, Lamborghini, Toyota, Honda, Ford) or a silly face emoji (🤪😜🤴😝🤡👻🙃😵🤣😂🥳😎🤓👽🫠). Items vary in size, fall speed, and start delay, then auto-remove after their animation completes. The counter resets when a new session starts.

### 4. Word List
- Sorted by `nextReview` ascending (most overdue first).
- Each entry shows: word, definition preview (truncated at 60 characters), a status badge, and a delete button.
- Status badges:
  - Mature — `interval >= 21`
  - Due — `nextReview <= today`
  - Upcoming — display the future review date
- Deleting a word requires a confirmation prompt.

### 5. Stats Screen
| Metric          | Calculation                                              |
|-----------------|----------------------------------------------------------|
| Total Words     | Total number of entries                                  |
| Due Today       | Count of entries where `nextReview <= today`             |
| Mature          | Count of entries where `interval >= 21`                  |
| Mastery %       | `mature / total × 100`, displayed as percentage + progress bar |
| Next Review     | Earliest `nextReview` date that is in the future         |

### 6. Reset / Delete
- "Reset All Progress": after confirmation, reset all entries to default SM-2 values while keeping the words themselves.
- "Delete All Words": after confirmation, remove all entries entirely.

---

## UI Layout

- Single-column centered layout with a maximum content width of ~520px.
- Navigation bar at the top with one button per screen; the active screen's button is visually highlighted.
- Color conventions:
  - Primary action: blue
  - Destructive / error: red
  - Warning / due: amber/orange
  - Success / mature: green
- Cards are white rounded containers with a subtle drop shadow.
- The flashcard has a minimum height and centers its content vertically.
- The mastery progress bar animates its width on update.
- "Know" button uses a green tint; "Don't Know" button uses a red tint.

---

## Keyboard Shortcuts (Review screen only)

| Key(s)                        | Action              |
|-------------------------------|---------------------|
| Space, Arrow Up, Arrow Down   | Flip card           |
| Arrow Right                   | Mark as "Know"      |
| Arrow Left                    | Mark as "Don't Know"|

---

## Edge Cases

- Submitting an empty word field shows an error; definition is always optional.
- Importing a file where all entries are duplicates shows a "0 added" warning.
- Opening the Review screen with no words shows an empty-state message instead of a card.
- `easeFactor` must never fall below `1.3`.
- All due dates are normalized to midnight of the local calendar day to avoid time-of-day drift.
