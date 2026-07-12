// Smoke and integration tests for modularized file structure
// Feature: modular-codebase, Task 10
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

console.log('\n── Smoke Tests: File Structure ──\n');

// Task 10.1: Verify file structure and script loading

const expectedJsFiles = [
  'storage.js', 'sm2.js', 'speech.js', 'celebration.js',
  'user.js', 'words.js', 'review.js', 'stats.js',
  'settings.js', 'export.js', 'ui.js', 'init.js'
];

test('All expected JS files exist in js/', () => {
  for (const file of expectedJsFiles) {
    const path = join(DIR, 'js', file);
    assert(existsSync(path), `Missing: js/${file}`);
  }
});

test('css/styles.css exists', () => {
  assert(existsSync(join(DIR, 'css', 'styles.css')), 'Missing: css/styles.css');
});

test('css/styles.css contains key selectors', () => {
  const css = readFileSync(join(DIR, 'css', 'styles.css'), 'utf8');
  assert(css.includes('body'), 'Missing body selector');
  assert(css.includes('.card'), 'Missing .card selector');
  assert(css.includes('nav'), 'Missing nav selector');
  assert(css.includes('rain-word'), 'Missing rain-word animation');
});

const html = readFileSync(join(DIR, 'index.html'), 'utf8');

test('index.html has no inline <style> blocks', () => {
  assert(!html.includes('<style>'), 'Found inline <style> block');
  assert(!html.includes('<style '), 'Found inline <style> block with attributes');
});

test('index.html has no inline <script> blocks (only src references)', () => {
  // Match <script> without src attribute (inline script blocks)
  const inlineScripts = html.match(/<script(?![^>]*\bsrc\b)[^>]*>/g);
  assert(!inlineScripts, `Found inline <script> block(s): ${inlineScripts}`);
});

test('index.html references css/styles.css', () => {
  assert(html.includes('href="css/styles.css"'), 'Missing stylesheet link');
});

test('Script tags appear in correct dependency order', () => {
  const scriptMatches = [...html.matchAll(/src="js\/([^"]+)"/g)].map(m => m[1]);
  assert(scriptMatches.length === expectedJsFiles.length,
    `Expected ${expectedJsFiles.length} script tags, found ${scriptMatches.length}`);

  for (let i = 0; i < expectedJsFiles.length; i++) {
    assert(scriptMatches[i] === expectedJsFiles[i],
      `Script at position ${i}: expected "${expectedJsFiles[i]}", got "${scriptMatches[i]}"`);
  }
});

console.log('\n── Smoke Tests: PWA Meta Tags ──\n');

test('Has manifest.json link', () => {
  assert(html.includes('href="manifest.json"'), 'Missing manifest.json link');
});

test('Has apple-mobile-web-app-capable meta', () => {
  assert(html.includes('apple-mobile-web-app-capable'), 'Missing apple-mobile-web-app-capable');
});

test('Has apple-mobile-web-app-status-bar-style meta', () => {
  assert(html.includes('apple-mobile-web-app-status-bar-style'), 'Missing status-bar-style');
});

test('Has apple-mobile-web-app-title meta', () => {
  assert(html.includes('apple-mobile-web-app-title'), 'Missing app title');
});

test('Has theme-color meta', () => {
  assert(html.includes('theme-color'), 'Missing theme-color');
});

console.log('\n── Integration Tests: Global Function Availability ──\n');

// Task 10.2: Verify onclick-referenced functions
// Extract all onclick handlers from index.html
const onclickMatches = [...html.matchAll(/onclick="([^"(]+)\(/g)].map(m => m[1]);
const onchangeMatches = [...html.matchAll(/onchange="([^"(]+)\(/g)].map(m => m[1]);
const allHandlers = [...new Set([...onclickMatches, ...onchangeMatches])];

test('All onclick/onchange handlers are defined in JS source files', () => {
  // Read all JS source to find window.X = function assignments
  let allJs = '';
  for (const file of expectedJsFiles) {
    allJs += readFileSync(join(DIR, 'js', file), 'utf8') + '\n';
  }

  const missingFns = [];
  for (const fn of allHandlers) {
    // Check for window.fnName = pattern
    const pattern = new RegExp(`window\\.${fn}\\s*=`);
    if (!pattern.test(allJs)) {
      missingFns.push(fn);
    }
  }

  assert(missingFns.length === 0,
    `Missing global functions for handlers: ${missingFns.join(', ')}`);
});

test('All JS modules expose functions via window object', () => {
  let allJs = '';
  for (const file of expectedJsFiles) {
    allJs += readFileSync(join(DIR, 'js', file), 'utf8') + '\n';
  }

  // Key functions that must be globally available
  const requiredGlobals = [
    'today', 'daysFromNow', 'storageKey', 'getUsers', 'saveUsers', 'save', 'migrateLegacy',
    'computeSM2', 'applyFlashcardSM2', 'applyWritingSM2',
    'speakWord', 'speakBtn',
    'showGoodJob',
    'renderUserList', 'createUser', 'deleteUser', 'selectUser', 'switchUser',
    'addWord', 'bulkAdd', 'fetchDefinition', 'importFile', 'deleteWord',
    'setReviewMode', 'startSession', 'showCard', 'flipCard', 'markCard',
    'renderStats', 'resetProgress', 'deleteAllWords',
    'getMWKey', 'saveMWKey',
    'downloadWords', 'restoreWords',
    'showView', 'renderList'
  ];

  const missing = requiredGlobals.filter(fn => {
    const pattern = new RegExp(`window\\.${fn}\\s*=`);
    return !pattern.test(allJs);
  });

  assert(missing.length === 0,
    `Missing window assignments for: ${missing.join(', ')}`);
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Smoke/Integration Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
