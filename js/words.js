// Word_Manager — word CRUD operations (add, delete, bulk add, import, not-found handling)
// Depends on: storage.js (words, save, daysFromNow), sm2.js, settings.js (getMWKey)

window.fetchDefinition = async function (w) {
  const mwKey = getMWKey();
  if (mwKey) {
    const res = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(w)}?key=${mwKey}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const entry = data[0];
    if (!entry || typeof entry !== 'object' || !entry.shortdef) throw new Error('not found');
    return entry.shortdef[0] || '';
  } else {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const meaning = data[0]?.meanings?.[0];
    const def = meaning?.definitions?.[0]?.definition || '';
    const example = meaning?.definitions?.[0]?.example || '';
    return [def, example ? `Example: ${example}` : ''].filter(Boolean).join(' | ');
  }
};

window.bulkAdd = async function () {
  const raw = document.getElementById('bulk-input').value;
  const words_input = [...new Set(raw.trim().split(/[\s,]+/).filter(Boolean))];
  if (!words_input.length) return;

  const progress = document.getElementById('bulk-progress');
  const notFoundDiv = document.getElementById('bulk-notfound');
  notFoundDiv.style.display = 'none';
  notFoundDiv.innerHTML = '';

  const notFound = [];
  let added = 0, skipped = 0;

  for (let i = 0; i < words_input.length; i++) {
    const w = words_input[i];
    progress.textContent = `Fetching ${i + 1} / ${words_input.length}: ${w}…`;

    if (words.find(x => x.word.toLowerCase() === w.toLowerCase())) { skipped++; continue; }

    try {
      const defText = await fetchDefinition(w);
      words.push({ word: w, def: defText, known: false, interval: 0, easeFactor: 2.5, nextReview: daysFromNow(0) });
      added++;
    } catch {
      notFound.push(w);
    }
  }

  save();
  progress.style.color = added ? 'green' : 'orange';
  progress.textContent = `Done. Added ${added} word(s)${skipped ? `, skipped ${skipped} duplicate(s)` : ''}${notFound.length ? `, ${notFound.length} not found` : ''}.`;
  document.getElementById('bulk-input').value = '';

  if (notFound.length) {
    notFoundDiv.style.display = 'block';
    renderNotFound(notFound);
  }
};

window.renderNotFound = function (list) {
  const div = document.getElementById('bulk-notfound');
  div.innerHTML = `
    <div style="background:#fef9c3;border:1px solid #fcd34d;border-radius:8px;padding:0.8rem">
      <div style="font-weight:600;color:#b45309;margin-bottom:0.5rem">⚠️ ${list.length} word(s) not found in dictionary:</div>
      <div id="notfound-list" style="display:flex;flex-direction:column;gap:0.4rem">
        ${list.map(w => `
          <div id="nf-${w}" style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem">
            <span style="font-weight:500">${w}</span>
            <div style="display:flex;gap:0.4rem">
              <button onclick="addManually('${w}')" style="padding:0.3rem 0.7rem;background:#3b82f6;color:white;border:none;border-radius:5px;cursor:pointer;font-size:0.85rem">Add Manually</button>
              <button onclick="ignoreNotFound('${w}')" style="padding:0.3rem 0.7rem;background:#e2e8f0;color:#475569;border:none;border-radius:5px;cursor:pointer;font-size:0.85rem">Ignore</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
};

window.addManually = function (w) {
  document.getElementById('input-word').value = w;
  document.getElementById('input-def').value = '';
  document.getElementById('input-def').focus();
  ignoreNotFound(w);
};

window.ignoreNotFound = function (w) {
  const el = document.getElementById(`nf-${w}`);
  if (el) el.remove();
  if (!document.getElementById('notfound-list').children.length)
    document.getElementById('bulk-notfound').style.display = 'none';
};

window.addWord = function () {
  const word = document.getElementById('input-word').value.trim();
  const def = document.getElementById('input-def').value.trim();
  const msg = document.getElementById('add-msg');
  if (!word) { msg.textContent = 'Please enter a word.'; msg.style.color = 'red'; return; }
  if (words.find(w => w.word.toLowerCase() === word.toLowerCase())) {
    msg.textContent = 'Word already exists.'; msg.style.color = 'orange'; return;
  }
  words.push({ word, def, known: false, interval: 0, easeFactor: 2.5, nextReview: daysFromNow(0) });
  save();
  document.getElementById('input-word').value = '';
  document.getElementById('input-def').value = '';
  msg.style.color = 'green';
  msg.textContent = `"${word}" added!`;
  setTimeout(() => msg.textContent = '', 2000);
};

window.importFile = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
    let added = 0, skipped = 0;
    lines.forEach(line => {
      const [word, ...rest] = line.split('|');
      const w = word.trim().replace(/\s+\d+$/, '');
      const def = rest.join('|').trim();
      if (!w) return;
      if (words.find(x => x.word.toLowerCase() === w.toLowerCase())) { skipped++; return; }
      words.push({ word: w, def, known: false, interval: 0, easeFactor: 2.5, nextReview: daysFromNow(0) });
      added++;
    });
    save();
    const msg = document.getElementById('import-msg');
    msg.style.color = added ? 'green' : 'orange';
    msg.textContent = `Imported ${added} word(s)${skipped ? `, skipped ${skipped} duplicate(s)` : ''}.`;
    e.target.value = '';
  };
  reader.readAsText(file);
};

window.deleteWord = function (i) {
  if (!confirm(`Delete "${words[i].word}"?`)) return;
  words.splice(i, 1);
  save();
  renderList();
};

window.editDefinition = function (i) {
  document.getElementById('def-display-' + i).style.display = 'none';
  document.getElementById('def-edit-' + i).style.display = 'block';
  document.getElementById('def-input-' + i).focus();
};

window.cancelEditDefinition = function (i) {
  document.getElementById('def-display-' + i).style.display = 'block';
  document.getElementById('def-edit-' + i).style.display = 'none';
};

window.saveDefinition = function (i) {
  var newDef = document.getElementById('def-input-' + i).value.trim();
  words[i].def = newDef;
  save();
  renderList();
};
