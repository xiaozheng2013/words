// SM2_Engine — SM-2 spaced repetition algorithm
// Depends on: storage.js (words, correctAnswersInSession, daysFromNow, save)

// Pure SM-2 computation — no side effects
window.computeSM2 = function (interval, easeFactor, known, fullCredit) {
  if (known) {
    interval = interval < 1 ? 1 : interval < 2 ? 2 : Math.round(interval * easeFactor);
    if (fullCredit) easeFactor = Math.max(1.3, easeFactor + 0.1);
  } else {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }
  return {
    interval: interval,
    easeFactor: easeFactor,
    nextReview: daysFromNow(interval),
    known: interval >= 21
  };
};

// Flashcard review — mutates word in words[], handles counter + celebration + save
window.applyFlashcardSM2 = function (wordStr, known) {
  var orig = words.find(function (x) { return x.word === wordStr; });
  if (!orig) return;
  if (known) {
    correctAnswersInSession++;
    if (correctAnswersInSession > 0 && correctAnswersInSession % 10 === 0) showGoodJob();
  }
  var result = computeSM2(orig.interval, orig.easeFactor, known, true);
  orig.interval = result.interval;
  orig.easeFactor = result.easeFactor;
  orig.nextReview = result.nextReview;
  orig.known = result.known;
  save();
};

// Writing review — mutates word in words[], handles counter + celebration + save
window.applyWritingSM2 = function (wordStr, known, fullCredit) {
  var orig = words.find(function (x) { return x.word === wordStr; });
  if (!orig) return;
  if (known) {
    correctAnswersInSession++;
    if (correctAnswersInSession > 0 && correctAnswersInSession % 10 === 0) showGoodJob();
  }
  var result = computeSM2(orig.interval, orig.easeFactor, known, fullCredit);
  orig.interval = result.interval;
  orig.easeFactor = result.easeFactor;
  orig.nextReview = result.nextReview;
  orig.known = result.known;
  save();
};
