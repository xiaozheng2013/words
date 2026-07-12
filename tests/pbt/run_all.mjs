#!/usr/bin/env node
// Runs all property-based and smoke tests
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));

const suites = [
  'sm2.test.mjs',
  'stats.test.mjs',
  'export.test.mjs',
  'storage.test.mjs',
  'smoke.test.mjs'
];

let allPassed = true;

for (const suite of suites) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Running: ${suite}`);
  console.log('═'.repeat(50));
  try {
    const output = execSync(`node ${join(DIR, suite)}`, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
  } catch (e) {
    console.log(e.stdout || '');
    console.error(e.stderr || '');
    allPassed = false;
  }
}

console.log(`\n${'═'.repeat(50)}`);
console.log(allPassed ? '✓ ALL TEST SUITES PASSED' : '✗ SOME TESTS FAILED');
console.log('═'.repeat(50));
process.exit(allPassed ? 0 : 1);
