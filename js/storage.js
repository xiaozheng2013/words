// Storage_Manager — foundation module
// Shared mutable state, utility functions, localStorage helpers, legacy migration

// --- Shared mutable state ---
window.currentUser = null;
window.words = [];
window.session = [];
window.sessionIdx = 0;
window.flipped = false;
window.correctAnswersInSession = 0;
window.reviewMode = 'flashcard';
window.writingAttempts = 0;
window.writingRevealed = false;

// --- Constants ---
window.usersKey = 'wm_users';

// --- Utility functions ---
window.today = () => new Date().setHours(0, 0, 0, 0);
window.daysFromNow = (d) => today() + d * 86400000;
window.storageKey = () => 'wm_words_' + currentUser;

// --- localStorage helpers ---
window.getUsers = () => JSON.parse(localStorage.getItem(usersKey) || '[]');
window.saveUsers = (u) => localStorage.setItem(usersKey, JSON.stringify(u));
window.save = () => localStorage.setItem(storageKey(), JSON.stringify(words));

// --- Legacy migration ---
window.migrateLegacy = function () {
  const legacy = localStorage.getItem('wm_words');
  if (!legacy) return;
  const users = getUsers();
  if (!users.includes('default')) {
    users.push('default');
    saveUsers(users);
    localStorage.setItem('wm_words_default', legacy);
    localStorage.removeItem('wm_words');
  }
};
