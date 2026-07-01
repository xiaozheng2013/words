# Requirements Document

## Introduction

The Word Memorizer application is currently a single monolithic `index.html` file (~795 lines) containing all HTML markup, CSS styles, and JavaScript logic inline. This modularization effort splits the codebase into separate, well-organized files to improve maintainability, readability, and developer experience — while preserving identical runtime behavior and PWA compatibility. No build tools or bundlers are introduced; the app remains a static, no-build PWA served directly from files.

## Glossary

- **App**: The Word Memorizer progressive web application
- **Module**: A standalone `.js` file containing a cohesive set of related functions and state
- **Stylesheet**: An external `.css` file linked from `index.html`
- **Entry_Point**: The `index.html` file that loads all modules and contains the HTML structure
- **Storage_Manager**: The module responsible for all `localStorage` read/write operations
- **SM2_Engine**: The module implementing the SM-2 spaced repetition algorithm
- **Review_Controller**: The module managing flashcard and writing review sessions
- **User_Manager**: The module handling user creation, selection, deletion, and switching
- **Word_Manager**: The module handling word CRUD operations (add, delete, bulk add, import)
- **Stats_Renderer**: The module responsible for computing and rendering statistics
- **UI_Controller**: The module managing view navigation, DOM rendering, and UI state
- **Celebration_Module**: The module responsible for the "good job" rain animation
- **Speech_Module**: The module responsible for text-to-speech pronunciation
- **Settings_Manager**: The module handling API key storage and settings UI
- **Export_Manager**: The module handling word list download and restore operations

## Requirements

### Requirement 1: Extract CSS into External Stylesheet

**User Story:** As a developer, I want all CSS styles extracted from the inline `<style>` block into a dedicated external stylesheet, so that I can edit styles independently from markup and logic.

#### Acceptance Criteria

1. THE Entry_Point SHALL load all application styles from an external `styles.css` file via a `<link>` element
2. WHEN the Stylesheet is loaded, THE App SHALL render identically to the current inline-styled version with no visual differences
3. THE Entry_Point SHALL contain no inline `<style>` blocks after extraction
4. THE Stylesheet SHALL preserve all existing CSS rules including the `rain-word` animation keyframes

### Requirement 2: Extract JavaScript into Modules

**User Story:** As a developer, I want all JavaScript logic extracted from the inline `<script>` block into separate `.js` files organized by concern, so that I can locate and modify functionality without scrolling through a monolithic file.

#### Acceptance Criteria

1. THE Entry_Point SHALL load JavaScript modules via `<script>` tags referencing external `.js` files
2. THE Entry_Point SHALL contain no inline `<script>` blocks after extraction
3. WHEN all script files are loaded, THE App SHALL expose the same global functions currently called by `onclick` handlers in the HTML markup
4. THE App SHALL organize JavaScript into the following modules at minimum: Storage_Manager, SM2_Engine, User_Manager, Word_Manager, Review_Controller, Stats_Renderer, UI_Controller, Celebration_Module, Speech_Module, Settings_Manager, and Export_Manager

### Requirement 3: Organize Files into Directory Structure

**User Story:** As a developer, I want the extracted files organized into a clear directory structure, so that I can navigate the project intuitively.

#### Acceptance Criteria

1. THE App SHALL place all extracted JavaScript modules in a `js/` directory
2. THE App SHALL place the extracted stylesheet in a `css/` directory
3. THE Entry_Point SHALL reference all extracted files using relative paths from the project root
4. WHEN the App is served from the project root, THE App SHALL load all resources without 404 errors

### Requirement 4: Preserve Functional Behavior

**User Story:** As a user, I want the modularized app to behave identically to the current version, so that no features are broken or changed during the refactor.

#### Acceptance Criteria

1. WHEN a user creates, selects, or deletes a user, THE User_Manager SHALL produce the same localStorage state and UI transitions as the current monolithic version
2. WHEN a user adds a word manually, via bulk add, or via file import, THE Word_Manager SHALL produce the same word entries with identical SM-2 default values as the current version
3. WHEN a user reviews cards in flashcard mode, THE Review_Controller SHALL apply the same SM-2 algorithm producing identical interval, easeFactor, and nextReview values as the current version
4. WHEN a user reviews cards in writing mode, THE Review_Controller SHALL apply the same attempt-based SM-2 logic (full credit on attempt 1, partial credit on attempts 2-3, "Don't Know" on 3 failures) as the current version
5. WHEN a user views statistics, THE Stats_Renderer SHALL compute and display the same metrics (total, due, mature, mastery percentage, next review date) as the current version
6. WHEN a user downloads or restores words, THE Export_Manager SHALL produce the same JSON output and import behavior as the current version
7. WHEN a user resets progress or deletes all words, THE App SHALL produce the same localStorage state as the current version
8. WHEN the celebration animation triggers (every 10 correct answers), THE Celebration_Module SHALL produce the same visual rain effect as the current version

### Requirement 5: Preserve PWA Compatibility

**User Story:** As a mobile user, I want the modularized app to remain installable as a PWA, so that I can continue using it from my home screen.

#### Acceptance Criteria

1. THE Entry_Point SHALL retain all existing PWA meta tags (apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-mobile-web-app-title, theme-color)
2. THE Entry_Point SHALL retain the manifest.json link
3. WHEN the App is served over HTTPS, THE App SHALL remain installable as a PWA on iOS and Android devices
4. THE manifest.json SHALL remain unchanged by the modularization

### Requirement 6: Preserve Keyboard Shortcuts

**User Story:** As a power user, I want keyboard shortcuts to continue working after modularization, so that I can review cards efficiently.

#### Acceptance Criteria

1. WHEN the review view is active in flashcard mode, THE Review_Controller SHALL register the same keyboard event listeners (Space/ArrowUp/ArrowDown to flip, ArrowLeft for "Don't Know", ArrowRight for "Know")
2. WHILE the review mode is set to writing, THE Review_Controller SHALL not intercept keyboard events so the text input captures keystrokes normally

### Requirement 7: Preserve Legacy Data Migration

**User Story:** As a returning user with data from the single-user version, I want my data to still be migrated automatically, so that I do not lose my word list.

#### Acceptance Criteria

1. WHEN the App loads and a `wm_words` key exists in localStorage, THE Storage_Manager SHALL migrate the data to a user named "default" and remove the legacy key
2. WHEN the App loads and existing word entries lack SM-2 fields (easeFactor, interval, nextReview), THE Storage_Manager SHALL patch those entries with default values (easeFactor=2.5, interval=0, nextReview=today)

### Requirement 8: Maintain Inline Event Handlers or Equivalent

**User Story:** As a developer, I want the HTML onclick handlers to continue working after modularization, so that no UI interactions break.

#### Acceptance Criteria

1. WHEN the Entry_Point uses `onclick` attributes referencing JavaScript functions, THE App SHALL ensure those functions are available in the global scope when the HTML is parsed
2. IF a module's function is referenced by an `onclick` handler, THEN THE module SHALL expose that function on the `window` object or the Entry_Point SHALL attach event listeners programmatically as an equivalent replacement

### Requirement 9: Preserve Text-to-Speech Functionality

**User Story:** As a user, I want word pronunciation to continue working after modularization, so that I can hear how words are spoken.

#### Acceptance Criteria

1. WHEN a user clicks the 🔊 button, THE Speech_Module SHALL speak the word using the Web Speech API with language set to "en-US"
2. WHEN a new writing review card is displayed, THE Speech_Module SHALL automatically speak the word aloud

### Requirement 10: Preserve Merriam-Webster API Integration

**User Story:** As a user, I want the dictionary API integration to continue working after modularization, so that I can auto-fill definitions during bulk add.

#### Acceptance Criteria

1. WHEN a Merriam-Webster API key is saved, THE Word_Manager SHALL use the Merriam-Webster Collegiate API for definition lookups during bulk add
2. WHEN no Merriam-Webster API key is saved, THE Word_Manager SHALL fall back to the Free Dictionary API for definition lookups
3. THE Settings_Manager SHALL read and write the API key to localStorage under the key "mw_api_key"

### Requirement 11: Ensure Correct Script Loading Order

**User Story:** As a developer, I want the module loading order to be explicitly defined, so that dependencies between modules are satisfied and no runtime errors occur.

#### Acceptance Criteria

1. THE Entry_Point SHALL load script files in an order that ensures each module's dependencies are available before the module executes
2. WHEN all scripts have loaded, THE App SHALL execute the initialization logic (legacy migration, user list rendering) exactly as the current version does
3. IF a script file fails to load, THEN THE App SHALL not throw unhandled errors that prevent other modules from functioning

### Requirement 12: Keep index.html as Minimal Structural Markup

**User Story:** As a developer, I want index.html to contain only HTML structure and resource references, so that it serves as a clean entry point.

#### Acceptance Criteria

1. THE Entry_Point SHALL contain only HTML markup, `<link>` references to stylesheets, and `<script>` references to JavaScript files
2. THE Entry_Point SHALL preserve the existing HTML element structure, IDs, and class names so that CSS selectors and JavaScript DOM queries continue to work
3. THE Entry_Point SHALL preserve all inline `style` attributes on HTML elements that are currently used for layout (e.g., flex containers, display toggles)
