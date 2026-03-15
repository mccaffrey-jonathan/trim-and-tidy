const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  currentSuite = { name, tests: [] };
  suites.push(currentSuite);
  fn();
  currentSuite = null;
}

export function it(name, fn) {
  if (!currentSuite) throw new Error('it() must be inside describe()');
  currentSuite.tests.push({ name, fn });
}

export const assert = {
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  ok(value, msg) {
    if (!value) {
      throw new Error(msg || `Expected truthy value, got ${JSON.stringify(value)}`);
    }
  },
  deepEqual(actual, expected, msg) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
      throw new Error(msg || `Deep equal failed:\n  actual:   ${a}\n  expected: ${b}`);
    }
  }
};

export function runTests() {
  const results = document.getElementById('results');
  let passed = 0;
  let failed = 0;

  for (const suite of suites) {
    const heading = document.createElement('div');
    heading.className = 'describe';
    heading.textContent = suite.name;
    results.appendChild(heading);

    for (const test of suite.tests) {
      const div = document.createElement('div');
      try {
        test.fn();
        div.className = 'pass';
        div.textContent = `  ✓ ${test.name}`;
        passed++;
      } catch (err) {
        div.className = 'fail';
        div.textContent = `  ✗ ${test.name}: ${err.message}`;
        failed++;
      }
      results.appendChild(div);
    }
  }

  const summary = document.createElement('div');
  summary.style.marginTop = '20px';
  summary.style.fontWeight = 'bold';
  summary.textContent = `${passed} passed, ${failed} failed, ${passed + failed} total`;
  summary.className = failed > 0 ? 'fail' : 'pass';
  results.appendChild(summary);
}
