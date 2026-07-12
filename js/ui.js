// UI_Controller — view switching and word list rendering
// Depends on: storage.js (words, today), review.js (startSession), stats.js (renderStats),
//             settings.js (getMWKey), words.js (deleteWord)

window.showView = function (name) {
  document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
  document.querySelectorAll('nav button').forEach(function (b) { b.classList.remove('active'); });
  document.getElementById('view-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'review') startSession();
  if (name === 'list') renderList();
  if (name === 'stats') renderStats();
  if (name === 'settings') {
    var key = getMWKey();
    if (key) document.getElementById('mw-key-input').value = key;
  }
};

window.renderList = function () {
  var el = document.getElementById('word-list');
  if (!words.length) { el.innerHTML = '<p style="color:#64748b;text-align:center">No words yet.</p>'; return; }
  var sorted = [].concat(words).map(function (w, i) { return Object.assign({}, w, { origIdx: i }); }).sort(function (a, b) { return a.nextReview - b.nextReview; });
  el.innerHTML = sorted.map(function (w) {
    var escapedDef = (w.def || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var displayDef = (w.def || '').length > 60 ? (w.def || '').slice(0, 60) + '\u2026' : (w.def || '');
    return '<div class="word-item">' +
      '<div style="flex:1;min-width:0">' +
        '<span>' + w.word + '</span>' +
        '<small id="def-display-' + w.origIdx + '" style="display:block">' + displayDef + '</small>' +
        '<div id="def-edit-' + w.origIdx + '" style="display:none;margin-top:0.3rem">' +
          '<textarea id="def-input-' + w.origIdx + '" style="width:100%;min-height:50px;padding:0.4rem;border:1px solid #cbd5e1;border-radius:4px;font-size:0.85rem;resize:vertical">' + escapedDef + '</textarea>' +
          '<div style="display:flex;gap:0.3rem;margin-top:0.3rem">' +
            '<button onclick="saveDefinition(' + w.origIdx + ')" style="padding:0.2rem 0.6rem;background:#22c55e;color:white;border:none;border-radius:4px;font-size:0.8rem;cursor:pointer">Save</button>' +
            '<button onclick="cancelEditDefinition(' + w.origIdx + ')" style="padding:0.2rem 0.6rem;background:#e2e8f0;color:#475569;border:none;border-radius:4px;font-size:0.8rem;cursor:pointer">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:0.5rem">' +
        '<small style="color:#64748b">' + (w.interval >= 21 ? '\uD83D\uDFE2 mature' : w.nextReview <= today() ? '\uD83D\uDD34 due' : '\uD83D\uDFE1 ' + new Date(w.nextReview).toLocaleDateString()) + '</small>' +
        '<button onclick="editDefinition(' + w.origIdx + ')" title="Edit">✏️</button>' +
        '<button onclick="deleteWord(' + w.origIdx + ')" title="Delete">\uD83D\uDDD1</button>' +
      '</div>' +
    '</div>';
  }).join('');
};
