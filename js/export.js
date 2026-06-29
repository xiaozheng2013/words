// Export_Manager — word list download and restore
// Dependencies: words, currentUser, save(), renderStats() (from storage.js and stats.js, available at call time via global scope)

window.downloadWords = function () {
  var data = JSON.stringify(words, null, 2);
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
  a.download = 'wordmem_' + currentUser + '_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
};

window.restoreWords = function (e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    var msg = document.getElementById('restore-msg');
    try {
      var imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error('invalid');
      var added = 0, updated = 0;
      imported.forEach(function (entry) {
        if (!entry.word) return;
        var existing = words.find(function (w) { return w.word.toLowerCase() === entry.word.toLowerCase(); });
        if (existing) {
          Object.assign(existing, entry);
          updated++;
        } else {
          words.push(entry);
          added++;
        }
      });
      save();
      renderStats();
      msg.style.color = 'green';
      msg.textContent = 'Restored: ' + added + ' added, ' + updated + ' updated.';
    } catch (err) {
      msg.style.color = 'red';
      msg.textContent = 'Invalid file.';
    }
    e.target.value = '';
  };
  reader.readAsText(file);
};
