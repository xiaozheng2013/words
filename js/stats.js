// Stats_Renderer — computes and renders statistics, reset/delete actions
// Depends on: storage.js (words, today, daysFromNow, save)

window.renderStats = function () {
  const total = words.length;
  const due = words.filter(w => w.nextReview <= today()).length;
  const mature = words.filter(w => w.interval >= 21).length;
  const pct = total ? Math.round(mature / total * 100) : 0;
  const next = words.filter(w => w.nextReview > today()).sort((a, b) => a.nextReview - b.nextReview);
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-known').textContent = due;
  document.getElementById('stat-learning').textContent = mature;
  document.getElementById('stat-pct').textContent = pct + '%';
  document.getElementById('stat-bar').style.width = pct + '%';
  document.getElementById('stat-next').textContent = next.length ? new Date(next[0].nextReview).toLocaleDateString() : '—';
};

window.deleteAllWords = function () {
  if (!confirm('Delete all words? This cannot be undone.')) return;
  words = [];
  save();
  renderStats();
};

window.resetProgress = function () {
  if (!confirm('Reset all progress? Words will be kept but SM-2 data will be cleared.')) return;
  words.forEach(w => { w.known = false; w.interval = 0; w.easeFactor = 2.5; w.nextReview = daysFromNow(0); });
  save();
  renderStats();
};
