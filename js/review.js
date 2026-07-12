// Review_Controller — flashcard and writing review session management
// Depends on: storage.js (words, session, sessionIdx, flipped, correctAnswersInSession,
//             reviewMode, writingAttempts, writingRevealed, today, daysFromNow, save)
//             sm2.js (applyFlashcardSM2, applyWritingSM2)
//             speech.js (speakWord, speakBtn)
//             celebration.js (showGoodJob)

window.setReviewMode = function (mode) {
  reviewMode = mode;
  document.getElementById('mode-flashcard').style.background = mode === 'flashcard' ? '#3b82f6' : 'white';
  document.getElementById('mode-flashcard').style.color = mode === 'flashcard' ? 'white' : '#333';
  document.getElementById('mode-writing').style.background = mode === 'writing' ? '#3b82f6' : 'white';
  document.getElementById('mode-writing').style.color = mode === 'writing' ? 'white' : '#333';
  startSession();
};

window.startSession = function (all) {
  if (all === undefined) all = false;
  var due = words.filter(function (w) { return w.nextReview <= today(); });
  var pool = all ? [].concat(words) : due;
  session = pool.sort(function () { return Math.random() - 0.5; });
  sessionIdx = 0;
  correctAnswersInSession = 0;
  document.getElementById('no-cards-msg').style.display = 'none';
  showCard();
};

window.buildHint = function (word, lettersRevealed) {
  return word.split('').map(function (ch, i) {
    return i < lettersRevealed ? ch : '_';
  }).join(' ');
};

window.showCard = function () {
  var card = document.getElementById('flashcard');
  var content = document.getElementById('card-content');
  var actions = document.getElementById('card-actions');
  var progress = document.getElementById('progress-text');

  if (!words.length) {
    document.getElementById('no-cards-msg').style.display = 'block';
    content.innerHTML = '';
    progress.textContent = '';
    actions.style.display = 'none';
    return;
  }

  if (!session.length || sessionIdx >= session.length) {
    var next = words.filter(function (w) { return w.nextReview > today(); }).sort(function (a, b) { return a.nextReview - b.nextReview; });
    var nextDate = next.length ? new Date(next[0].nextReview).toLocaleDateString() : '';
    content.innerHTML = '<div class="word" style="font-size:1.2rem">' + (sessionIdx > 0 ? '✅ Session done!' : '🎉 All caught up!') + '<br><small style="font-weight:400;color:#64748b">' + (nextDate ? 'Next review: ' + nextDate : '') + '</small></div>';
    progress.textContent = '';
    actions.style.display = 'none';
    card.onclick = null;
    return;
  }

  var w = session[sessionIdx];
  progress.textContent = (sessionIdx + 1) + ' / ' + session.length;

  if (reviewMode === 'writing') {
    writingAttempts = 0;
    writingRevealed = false;
    actions.style.display = 'none';
    card.onclick = null;
    renderWritingCard(w, '', null);
    speakWord(w.word);
  } else {
    flipped = false;
    actions.style.display = 'flex';
    actions.style.visibility = 'hidden';
    card.onclick = flipCard;
    content.innerHTML = '<div><div class="word">' + w.word + '</div>' + speakBtn(w.word) + '<div class="hint">tap to reveal</div></div>';
  }
};

window.renderWritingCard = function (w, feedback, feedbackColor) {
  var maxAttempts = 3;
  var remaining = maxAttempts - writingAttempts;
  var dots = '●'.repeat(remaining) + '○'.repeat(maxAttempts - remaining);
  var hintText = writingAttempts >= 1 ? buildHint(w.word, writingAttempts) : '';
  document.getElementById('card-content').innerHTML =
    '<div style="width:100%">' +
      '<div style="margin-bottom:0.6rem">' + speakBtn(w.word) + '</div>' +
      (feedback ? '<div style="color:' + feedbackColor + ';font-weight:600;margin-bottom:0.4rem">' + feedback + '</div>' : '') +
      (hintText ? '<div style="font-family:monospace;font-size:1rem;letter-spacing:0.15em;color:#64748b;margin-bottom:0.6rem">' + hintText + '</div>' : '') +
      '<input id="writing-input" type="text" placeholder="Type the word…"' +
        ' style="width:100%;padding:0.6rem 0.8rem;border:1px solid #cbd5e1;border-radius:6px;font-size:1rem;margin-bottom:0.5rem"' +
        ' onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitWriting()}" />' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<button onclick="submitWriting()" style="padding:0.5rem 1.2rem;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:1rem;cursor:pointer">Submit</button>' +
        '<span style="font-size:1.2rem;letter-spacing:0.1em;color:#64748b">' + dots + '</span>' +
      '</div>' +
    '</div>';
  document.getElementById('writing-input').focus();
};

window.renderWritingReveal = function (w, correct) {
  var color = correct ? '#16a34a' : '#ef4444';
  var icon = correct ? '✅' : '❌';
  var escapedDef = (w.def || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  document.getElementById('card-content').innerHTML =
    '<div style="width:100%">' +
      '<div style="font-size:1.6rem;font-weight:700;color:' + color + ';margin-bottom:0.3rem">' + icon + ' ' + w.word + '</div>' +
      speakBtn(w.word) +
      '<div id="writing-def-display" style="color:#475569;margin-top:0.5rem;font-size:1rem">' + (w.def || '') + '</div>' +
      '<button id="writing-edit-def-btn" onclick="startWritingDefEdit()" style="margin-top:0.4rem;padding:0.25rem 0.6rem;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:5px;font-size:0.8rem;cursor:pointer">✏️ Edit definition</button>' +
      '<div id="writing-def-edit" style="display:none;margin-top:0.5rem;width:100%">' +
        '<textarea id="writing-def-input" style="width:100%;min-height:60px;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;resize:vertical">' + escapedDef + '</textarea>' +
        '<div style="display:flex;gap:0.4rem;margin-top:0.4rem">' +
          '<button onclick="saveWritingDef()" style="padding:0.3rem 0.8rem;background:#22c55e;color:white;border:none;border-radius:5px;font-size:0.85rem;cursor:pointer">Save</button>' +
          '<button onclick="cancelWritingDefEdit()" style="padding:0.3rem 0.8rem;background:#e2e8f0;color:#475569;border:none;border-radius:5px;font-size:0.85rem;cursor:pointer">Cancel</button>' +
        '</div>' +
      '</div>' +
      '<button onclick="advanceWriting()" style="margin-top:1rem;padding:0.5rem 1.2rem;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:1rem;cursor:pointer">Next →</button>' +
    '</div>';
};

window.startWritingDefEdit = function () {
  document.getElementById('writing-def-display').style.display = 'none';
  document.getElementById('writing-edit-def-btn').style.display = 'none';
  document.getElementById('writing-def-edit').style.display = 'block';
  document.getElementById('writing-def-input').focus();
};

window.cancelWritingDefEdit = function () {
  document.getElementById('writing-def-display').style.display = '';
  document.getElementById('writing-edit-def-btn').style.display = '';
  document.getElementById('writing-def-edit').style.display = 'none';
};

window.saveWritingDef = function () {
  var w = session[sessionIdx];
  var newDef = document.getElementById('writing-def-input').value.trim();
  w.def = newDef;
  save();
  document.getElementById('writing-def-display').textContent = newDef;
  cancelWritingDefEdit();
};

window.submitWriting = function () {
  if (writingRevealed) { advanceWriting(); return; }
  var w = session[sessionIdx];
  var input = document.getElementById('writing-input');
  if (!input) return;
  var answer = input.value.trim();
  var correct = answer.toLowerCase() === w.word.toLowerCase();
  writingAttempts++;

  if (correct) {
    writingRevealed = true;
    applyWritingSM2(w.word, true, writingAttempts === 1);
    renderWritingReveal(w, true);
  } else if (writingAttempts >= 3) {
    writingRevealed = true;
    applyWritingSM2(w.word, false, false);
    renderWritingReveal(w, false);
  } else {
    renderWritingCard(w, '❌ Wrong, try again!', '#ef4444');
  }
};

window.advanceWriting = function () {
  sessionIdx++;
  showCard();
};

window.flipCard = function () {
  if (reviewMode === 'writing') return;
  if (sessionIdx >= session.length || !session.length) return;
  if (flipped) return;
  flipped = true;
  var w = session[sessionIdx];
  var escapedDef = (w.def || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  document.getElementById('card-content').innerHTML =
    '<div><div class="word">' + w.word + '</div>' + speakBtn(w.word) +
    '<div class="definition" id="review-def-display">' + (w.def || '') + '</div>' +
    '<button id="review-edit-def-btn" onclick="event.stopPropagation();startReviewDefEdit()" style="margin-top:0.5rem;padding:0.25rem 0.6rem;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:5px;font-size:0.8rem;cursor:pointer">✏️ Edit definition</button>' +
    '<div id="review-def-edit" style="display:none;margin-top:0.5rem;width:100%">' +
      '<textarea id="review-def-input" style="width:100%;min-height:60px;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;resize:vertical" onclick="event.stopPropagation()">' + escapedDef + '</textarea>' +
      '<div style="display:flex;gap:0.4rem;margin-top:0.4rem">' +
        '<button onclick="event.stopPropagation();saveReviewDef()" style="padding:0.3rem 0.8rem;background:#22c55e;color:white;border:none;border-radius:5px;font-size:0.85rem;cursor:pointer">Save</button>' +
        '<button onclick="event.stopPropagation();cancelReviewDefEdit()" style="padding:0.3rem 0.8rem;background:#e2e8f0;color:#475569;border:none;border-radius:5px;font-size:0.85rem;cursor:pointer">Cancel</button>' +
      '</div>' +
    '</div>' +
    '</div>';
  document.getElementById('card-actions').style.visibility = 'visible';
};

window.startReviewDefEdit = function () {
  document.getElementById('review-def-display').style.display = 'none';
  document.getElementById('review-edit-def-btn').style.display = 'none';
  document.getElementById('review-def-edit').style.display = 'block';
  document.getElementById('review-def-input').focus();
};

window.cancelReviewDefEdit = function () {
  document.getElementById('review-def-display').style.display = '';
  document.getElementById('review-edit-def-btn').style.display = '';
  document.getElementById('review-def-edit').style.display = 'none';
};

window.saveReviewDef = function () {
  var w = session[sessionIdx];
  var newDef = document.getElementById('review-def-input').value.trim();
  w.def = newDef;
  save();
  document.getElementById('review-def-display').textContent = newDef;
  cancelReviewDefEdit();
};

window.markCard = function (known) {
  if (reviewMode === 'writing') return;
  var w = session[sessionIdx];
  applyFlashcardSM2(w.word, known);
  sessionIdx++;
  showCard();
};

// Keyboard event listener — active only in flashcard review mode
document.addEventListener('keydown', function (e) {
  if (!document.getElementById('view-review').classList.contains('active')) return;
  if (reviewMode === 'writing') return;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); flipCard(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); markCard(false); }
  if (e.key === 'ArrowRight') { e.preventDefault(); markCard(true); }
});
