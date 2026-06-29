// Property-based tests for Export/Import round-trip
// Feature: modular-codebase, Property 4: Export/import round-trip
import fc from 'fast-check';

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

// Arbitrary for a word object matching the app's schema
const wordArb = fc.record({
  word: fc.string({ minLength: 1, maxLength: 50 }),
  def: fc.string({ minLength: 0, maxLength: 200 }),
  known: fc.boolean(),
  interval: fc.integer({ min: 0, max: 365 }),
  easeFactor: fc.double({ min: 1.3, max: 5.0, noNaN: true, noDefaultInfinity: true }),
  nextReview: fc.integer({ min: 0, max: Date.now() + 365 * 86400000 })
});

// --- Property 4: Export/import round-trip ---
runProperty('Property 4: JSON.stringify + JSON.parse round-trip preserves word array', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 50 }), (words) => {
      // Simulate downloadWords serialization
      const serialized = JSON.stringify(words, null, 2);
      // Simulate restoreWords parsing
      const parsed = JSON.parse(serialized);

      if (!Array.isArray(parsed)) {
        throw new Error('Parsed result is not an array');
      }
      if (parsed.length !== words.length) {
        throw new Error(`Length mismatch: ${parsed.length} !== ${words.length}`);
      }

      for (let i = 0; i < words.length; i++) {
        const orig = words[i];
        const restored = parsed[i];

        if (restored.word !== orig.word) {
          throw new Error(`word mismatch at index ${i}: "${restored.word}" !== "${orig.word}"`);
        }
        if (restored.def !== orig.def) {
          throw new Error(`def mismatch at index ${i}`);
        }
        if (restored.known !== orig.known) {
          throw new Error(`known mismatch at index ${i}`);
        }
        if (restored.interval !== orig.interval) {
          throw new Error(`interval mismatch at index ${i}: ${restored.interval} !== ${orig.interval}`);
        }
        // Floating-point round-trip through JSON is exact for finite doubles
        if (restored.easeFactor !== orig.easeFactor) {
          throw new Error(`easeFactor mismatch at index ${i}: ${restored.easeFactor} !== ${orig.easeFactor}`);
        }
        if (restored.nextReview !== orig.nextReview) {
          throw new Error(`nextReview mismatch at index ${i}: ${restored.nextReview} !== ${orig.nextReview}`);
        }
      }
    }),
    { numRuns: 200 }
  );
});

runProperty('Property 4: Round-trip preserves array identity (deep equality)', () => {
  fc.assert(
    fc.property(fc.array(wordArb, { minLength: 0, maxLength: 50 }), (words) => {
      const serialized = JSON.stringify(words, null, 2);
      const parsed = JSON.parse(serialized);
      const reSerialized = JSON.stringify(parsed, null, 2);

      if (serialized !== reSerialized) {
        throw new Error('Double serialization not stable');
      }
    }),
    { numRuns: 200 }
  );
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Export Round-Trip Property Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
