// Speech_Module — standalone text-to-speech utility
// Dependencies: none (uses Web Speech API)

window.speakWord = function (word) {
  var utt = new SpeechSynthesisUtterance(word);
  utt.lang = 'en-US';
  speechSynthesis.cancel();
  speechSynthesis.speak(utt);
};

window.speakBtn = function (word) {
  return '<button onclick="event.stopPropagation();speakWord(\'' + word.replace(/'/g, "\\'") + '\')"' +
    ' style="margin-top:0.6rem;background:none;border:1px solid #cbd5e1;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:1rem" title="Pronounce">🔊</button>';
};
