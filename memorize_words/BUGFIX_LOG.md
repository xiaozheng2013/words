## [2026-03-28] Switch user does not reset active tab to Stats

**File(s) affected:** memorize_words/index.html
**Description:** When a user navigated to the "My Words" tab and then switched to a different user, the app retained the previously active tab ("My Words") instead of resetting to the Stats view.
**Fix:** In `selectUser()`, added explicit reset of all `.view` and `nav button` active classes before activating `view-stats` and its corresponding nav button, ensuring Stats is always the landing view when any user is selected.
