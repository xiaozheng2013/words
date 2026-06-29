// Property-based tests for User storage round-trip
// Feature: modular-codebase, Property 5: User storage round-trip
import fc from 'fast-check';

// Mock localStorage for Node.js
const store = {};
const localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; },
  clear() { for (const k in store) delete store[k]; }
};

// Inline the storage helpers
const usersKey = 'wm_users';
const getUsers = () => JSON.parse(localStorage.getItem(usersKey) || '[]');
const saveUsers = (u) => localStorage.setItem(usersKey, JSON.stringify(u));

let passed = 0;
let failed = 0;

function runProperty(name, fn) {
  console.log(`\nProperty: ${name}`);
  try {
    fn();
    passed++;
    console.log(`  ✓ PASS`);
  } catch (e) {
    failed++;
    console.error(`  FAIL: ${e.message}`);
    if (e.counterexample) console.error(`  Counterexample: ${JSON.stringify(e.counterexample)}`);
  }
}

// Arbitrary: unique non-empty usernames (lowercase alpha + digits, no special chars that could break JSON)
const usernameArb = fc.string({ minLength: 1, maxLength: 20, unit: fc.constantFrom(
  ...'abcdefghijklmnopqrstuvwxyz0123456789_'.split('')
) });

const uniqueUsernamesArb = fc.uniqueArray(usernameArb, { minLength: 0, maxLength: 20 });

// --- Property 5: User storage round-trip ---
runProperty('Property 5: saveUsers/getUsers round-trip', () => {
  fc.assert(
    fc.property(uniqueUsernamesArb, (usernames) => {
      localStorage.clear();
      saveUsers(usernames);
      const loaded = getUsers();

      if (loaded.length !== usernames.length) {
        throw new Error(`Length mismatch: saved ${usernames.length}, loaded ${loaded.length}`);
      }

      for (let i = 0; i < usernames.length; i++) {
        if (loaded[i] !== usernames[i]) {
          throw new Error(`Mismatch at index ${i}: "${loaded[i]}" !== "${usernames[i]}"`);
        }
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 5: Empty user list round-trip', () => {
  fc.assert(
    fc.property(fc.constant([]), (users) => {
      localStorage.clear();
      saveUsers(users);
      const loaded = getUsers();
      if (loaded.length !== 0) {
        throw new Error(`Expected empty array, got ${JSON.stringify(loaded)}`);
      }
    }),
    { numRuns: 10 }
  );
});

runProperty('Property 5: getUsers returns empty array when no data exists', () => {
  localStorage.clear();
  const loaded = getUsers();
  if (!Array.isArray(loaded) || loaded.length !== 0) {
    throw new Error(`Expected empty array, got ${JSON.stringify(loaded)}`);
  }
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Storage Round-Trip Property Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
