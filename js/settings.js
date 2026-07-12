// Settings_Manager — Merriam-Webster API key management
// Dependencies: none (uses localStorage and DOM)

window.getMWKey = function () {
  return localStorage.getItem('mw_api_key') || '';
};

window.saveMWKey = function () {
  var key = document.getElementById('mw-key-input').value.trim();
  var msg = document.getElementById('mw-key-msg');
  if (!key) { msg.style.color = 'red'; msg.textContent = 'Please enter a key.'; return; }
  localStorage.setItem('mw_api_key', key);
  msg.style.color = 'green';
  msg.textContent = 'Key saved!';
  setTimeout(function () { msg.textContent = ''; }, 2000);
};
