// User_Manager — user creation, selection, deletion, switching
// Depends on: storage.js (currentUser, words, session, sessionIdx, getUsers, saveUsers, storageKey, daysFromNow, today)
// Also depends on: renderStats() from stats.js (available at call time via global scope)

window.renderUserList = function () {
  const users = getUsers();
  const el = document.getElementById('user-list');
  if (!users.length) { el.innerHTML = '<p style="color:#64748b;text-align:center">No users yet. Create one below.</p>'; return; }
  el.innerHTML = users.map(u => `
    <div style="display:flex;align-items:center;justify-content:space-between;background:white;border-radius:8px;padding:0.7rem 1rem;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <span style="font-weight:600">${u}</span>
      <div style="display:flex;gap:0.5rem">
        <button onclick="selectUser('${u}')" style="padding:0.4rem 0.9rem;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer">Select</button>
        <button onclick="deleteUser('${u}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem">🗑</button>
      </div>
    </div>`).join('');
};

window.createUser = function () {
  const input = document.getElementById('new-username');
  const name = input.value.trim();
  const msg = document.getElementById('user-msg');
  if (!name) { msg.textContent = 'Please enter a username.'; return; }
  const users = getUsers();
  if (users.find(u => u.toLowerCase() === name.toLowerCase())) { msg.textContent = 'Username already exists.'; return; }
  users.push(name);
  saveUsers(users);
  input.value = '';
  msg.textContent = '';
  renderUserList();
};

window.deleteUser = function (name) {
  if (!confirm(`Delete user "${name}" and all their words?`)) return;
  const users = getUsers().filter(u => u !== name);
  saveUsers(users);
  localStorage.removeItem('wm_words_' + name);
  renderUserList();
};

window.selectUser = function (name) {
  currentUser = name;
  words = JSON.parse(localStorage.getItem(storageKey()) || '[]');
  words.forEach(w => {
    if (!w.easeFactor) { w.easeFactor = 2.5; w.interval = 0; w.nextReview = daysFromNow(0); }
  });
  document.getElementById('user-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('current-user-label').textContent = '👤 ' + name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('view-stats').classList.add('active');
  document.querySelector('nav button[onclick="showView(\'stats\')"]').classList.add('active');
  renderStats();
};

window.switchUser = function () {
  currentUser = null;
  words = [];
  session = []; sessionIdx = 0;
  document.getElementById('main-app').style.display = 'none';
    document.getElementById('user-screen').style.display = 'flex';
  renderUserList();
};
