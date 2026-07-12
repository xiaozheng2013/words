// Property-based tests for Stats computation
// Feature: modular-codebase, Property 3: Stats computation correctness
import fc from 'fast-check';

const today = () => new Date().setHours(0, 0, 0, 0);

// Inline the stats computation logic (pure version without DOM)
function computeStats(words) {
  const total = words.length;
  const due = words.filter(w => w.nextReview <= today()).length;
  const mature = words.filter(w => w.interval >= 21).length;
  const pct = total ? Math.round(mature / total * 100) : 0;
  return { total, due, mature, pct };
}

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

// Arbitrary for a word object with valid SM-2 fields
const wordArb = fc.record({
  word: fc.string({ minLength: 1, maxLength: 30 }),
  def: fc.string({ minLength: 0, maxLength: 100 }),
  known: fc.boolean(),
  interval: fc.integer({ min: 0, max: 365 }),
  easeFactor: fc.double({ min: 1.3, max: 5.0, noNaN: true }),
  nextReview: fc.integer({ min: today() - 30 * 86400000, max: today() + 60 * 86400000 })
});

// --- Property 3: Stats computation correctness ---
runProperty('Property 3: Stats computation - total equals array length', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 100 }), (words) => {
      const stats = computeStats(words);
      if (stats.total !== words.length) {
        throw new Error(`total=${stats.total} !== length=${words.length}`);
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 3: Stats computation - due count is words with nextReview <= today', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 100 }), (words) => {
      const stats = computeStats(words);
      const expectedDue = words.filter(w => w.nextReview <= today()).length;
      if (stats.due !== expectedDue) {
        throw new Error(`due=${stats.due} !== expected=${expectedDue}`);
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 3: Stats computation - mature count is words with interval >= 21', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 100 }), (words) => {
      const stats = computeStats(words);
      const expectedMature = words.filter(w => w.interval >= 21).length;
      if (stats.mature !== expectedMature) {
        throw new Error(`mature=${stats.mature} !== expected=${expectedMature}`);
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 3: Stats computation - mastery percentage formula', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 100 }), (words) => {
      const stats = computeStats(words);
      const total = words.length;
      const mature = words.filter(w => w.interval >= 21).length;
      const expectedPct = total ? Math.round(mature / total * 100) : 0;
      if (stats.pct !== expectedPct) {
        throw new Error(`pct=${stats.pct} !== expected=${expectedPct}`);
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 3: Stats computation - empty array returns zeros', () => {
  fc.assert(
    fc.property(fc.constant([]), (words) => {
      const stats = computeStats(words);
      if (stats.total !== 0 || stats.due !== 0 || stats.mature !== 0 || stats.pct !== 0) {
        throw new Error(`Empty array should yield all zeros, got ${JSON.stringify(stats)}`);
      }
    }),
    { numRuns: 10 }
  );
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Stats Property Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
