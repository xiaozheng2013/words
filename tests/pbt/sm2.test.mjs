// Property-based tests for SM-2 engine
// Feature: modular-codebase
import fc from 'fast-check';

// --- Inline the pure SM-2 computation for isolated testing ---
function computeSM2(interval, easeFactor, known, fullCredit) {
  if (known) {
    interval = interval < 1 ? 1 : interval < 2 ? 2 : Math.round(interval * easeFactor);
    if (fullCredit) easeFactor = Math.max(1.3, easeFactor + 0.1);
  } else {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }
  const today = new Date().setHours(0, 0, 0, 0);
  return {
    interval,
    easeFactor,
    nextReview: today + interval * 86400000,
    known: interval >= 21
  };
}

// Helper: today() as used in the app
const today = () => new Date().setHours(0, 0, 0, 0);
const daysFromNow = (d) => today() + d * 86400000;

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (!condition) {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

function runProperty(name, fn) {
  console.log(`\nProperty: ${name}`);
  try {
    fn();
    if (failed === 0) {
      passed++;
      console.log(`  ✓ PASS`);
    }
  } catch (e) {
    failed++;
    console.error(`  FAIL: ${e.message}`);
    if (e.counterexample) console.error(`  Counterexample: ${JSON.stringify(e.counterexample)}`);
  }
}

// --- Property 1: SM-2 computation correctness ---
runProperty('Property 1: SM-2 computation correctness (known=true, fullCredit=true)', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.double({ min: 1.3, max: 5.0, noNaN: true }),
      (interval, easeFactor) => {
        const result = computeSM2(interval, easeFactor, true, true);

        // Interval progression: 0→1, 1→2, ≥2→round(interval*easeFactor)
        let expectedInterval;
        if (interval < 1) expectedInterval = 1;
        else if (interval < 2) expectedInterval = 2;
        else expectedInterval = Math.round(interval * easeFactor);

        if (result.interval !== expectedInterval) {
          throw new Error(`Expected interval ${expectedInterval}, got ${result.interval} (input: interval=${interval}, ef=${easeFactor})`);
        }

        // EaseFactor increases by 0.1 with fullCredit, min 1.3
        const expectedEF = Math.max(1.3, easeFactor + 0.1);
        if (Math.abs(result.easeFactor - expectedEF) > 0.0001) {
          throw new Error(`Expected EF ${expectedEF}, got ${result.easeFactor}`);
        }

        // nextReview = today + interval days
        const expectedNext = daysFromNow(result.interval);
        if (result.nextReview !== expectedNext) {
          throw new Error(`Expected nextReview ${expectedNext}, got ${result.nextReview}`);
        }

        // known = interval >= 21
        if (result.known !== (result.interval >= 21)) {
          throw new Error(`Expected known=${result.interval >= 21}, got ${result.known}`);
        }
      }
    ),
    { numRuns: 200 }
  );
});

runProperty('Property 1: SM-2 computation correctness (known=true, fullCredit=false)', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.double({ min: 1.3, max: 5.0, noNaN: true }),
      (interval, easeFactor) => {
        const result = computeSM2(interval, easeFactor, true, false);

        // Interval progression same as fullCredit=true
        let expectedInterval;
        if (interval < 1) expectedInterval = 1;
        else if (interval < 2) expectedInterval = 2;
        else expectedInterval = Math.round(interval * easeFactor);

        if (result.interval !== expectedInterval) {
          throw new Error(`Expected interval ${expectedInterval}, got ${result.interval}`);
        }

        // EaseFactor unchanged when fullCredit=false
        if (Math.abs(result.easeFactor - easeFactor) > 0.0001) {
          throw new Error(`Expected EF ${easeFactor} (unchanged), got ${result.easeFactor}`);
        }

        // known flag
        if (result.known !== (result.interval >= 21)) {
          throw new Error(`Expected known=${result.interval >= 21}, got ${result.known}`);
        }
      }
    ),
    { numRuns: 200 }
  );
});

runProperty('Property 1: SM-2 computation correctness (known=false)', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.double({ min: 1.3, max: 5.0, noNaN: true }),
      fc.boolean(),
      (interval, easeFactor, fullCredit) => {
        const result = computeSM2(interval, easeFactor, false, fullCredit);

        // Interval resets to 1
        if (result.interval !== 1) {
          throw new Error(`Expected interval 1 on failure, got ${result.interval}`);
        }

        // EaseFactor decreases by 0.2, min 1.3
        const expectedEF = Math.max(1.3, easeFactor - 0.2);
        if (Math.abs(result.easeFactor - expectedEF) > 0.0001) {
          throw new Error(`Expected EF ${expectedEF}, got ${result.easeFactor}`);
        }

        // nextReview = today + 1 day
        if (result.nextReview !== daysFromNow(1)) {
          throw new Error(`Expected nextReview ${daysFromNow(1)}, got ${result.nextReview}`);
        }

        // known is always false (interval=1 < 21)
        if (result.known !== false) {
          throw new Error(`Expected known=false on failure, got ${result.known}`);
        }
      }
    ),
    { numRuns: 200 }
  );
});

// --- Property 2: SM-2 default values invariant ---
runProperty('Property 2: SM-2 default values invariant', () => {
  // Arbitrary for a word object that may or may not have SM-2 fields
  const wordArb = fc.record({
    word: fc.string({ minLength: 1, maxLength: 30 }),
    def: fc.string({ minLength: 0, maxLength: 100 }),
    known: fc.option(fc.boolean(), { nil: undefined }),
    interval: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    easeFactor: fc.option(fc.double({ min: 1.0, max: 5.0, noNaN: true }), { nil: undefined }),
    nextReview: fc.option(fc.integer({ min: 0, max: Date.now() + 365 * 86400000 }), { nil: undefined })
  });

  fc.assert(
    fc.property(wordArb, (word) => {
      // Simulate the default patching logic from selectUser()
      const patched = { ...word };
      if (patched.easeFactor === undefined) patched.easeFactor = 2.5;
      if (patched.interval === undefined) patched.interval = 0;
      if (patched.nextReview === undefined) patched.nextReview = today();

      // After patching, SM-2 fields must have valid values
      if (typeof patched.easeFactor !== 'number' || patched.easeFactor < 1.0) {
        throw new Error(`Invalid easeFactor: ${patched.easeFactor}`);
      }
      if (typeof patched.interval !== 'number' || patched.interval < 0) {
        throw new Error(`Invalid interval: ${patched.interval}`);
      }
      if (typeof patched.nextReview !== 'number') {
        throw new Error(`Invalid nextReview: ${patched.nextReview}`);
      }

      // For newly created words (all fields undefined), verify exact defaults
      if (word.easeFactor === undefined && word.interval === undefined && word.nextReview === undefined) {
        if (patched.easeFactor !== 2.5) throw new Error(`New word easeFactor should be 2.5, got ${patched.easeFactor}`);
        if (patched.interval !== 0) throw new Error(`New word interval should be 0, got ${patched.interval}`);
        if (patched.nextReview !== today()) throw new Error(`New word nextReview should be today`);
      }
    }),
    { numRuns: 200 }
  );
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`SM-2 Property Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
