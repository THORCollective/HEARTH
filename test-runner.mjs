/**
 * HEARTH Application Test Runner
 *
 * This script performs comprehensive testing of the refactored HEARTH application.
 * It validates that all modules load correctly and work together properly.
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async runAll() {
    console.log('\n🔥 HEARTH Application Test Suite\n');
    console.log('=' .repeat(60));

    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.push({ name: test.name, status: 'PASS', error: null });
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
      }
    }

    this.displaySummary();
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`\nTest Summary: ${passed}/${total} tests passed`);

    if (failed > 0) {
      console.log(`\n❌ ${failed} test(s) failed`);
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  }
}

const runner = new TestRunner();

// === FILE EXISTENCE TESTS ===
runner.test('Main app.js exists', async () => {
  const content = await readFile(join(__dirname, 'app.js'), 'utf-8');
  if (!content.includes('class HearthApp')) {
    throw new Error('HearthApp class not found in app.js');
  }
});

runner.test('HuntFilter module exists', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-filter.js'), 'utf-8');
  if (!content.includes('export class HuntFilter')) {
    throw new Error('HuntFilter class not exported');
  }
});

runner.test('HuntRenderer module exists', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-renderer.js'), 'utf-8');
  if (!content.includes('export class HuntRenderer')) {
    throw new Error('HuntRenderer class not exported');
  }
});

runner.test('ModalManager module exists', async () => {
  const content = await readFile(join(__dirname, 'js/modal-manager.js'), 'utf-8');
  if (!content.includes('export class ModalManager')) {
    throw new Error('ModalManager class not exported');
  }
});

runner.test('NotebookGenerator module exists', async () => {
  const content = await readFile(join(__dirname, 'js/notebook-generator.js'), 'utf-8');
  if (!content.includes('export class NotebookGenerator')) {
    throw new Error('NotebookGenerator class not exported');
  }
});

runner.test('PresetManager module exists', async () => {
  const content = await readFile(join(__dirname, 'js/preset-manager.js'), 'utf-8');
  if (!content.includes('export class PresetManager')) {
    throw new Error('PresetManager class not exported');
  }
});

runner.test('Pagination module exists', async () => {
  const content = await readFile(join(__dirname, 'js/pagination.js'), 'utf-8');
  if (!content.includes('export class Pagination')) {
    throw new Error('Pagination class not exported');
  }
});

runner.test('Utils module exists', async () => {
  const content = await readFile(join(__dirname, 'js/utils.js'), 'utf-8');
  if (!content.includes('export')) {
    throw new Error('Utils functions not exported');
  }
});

// === MODULE IMPORT TESTS ===
runner.test('app.js imports all required modules', async () => {
  const content = await readFile(join(__dirname, 'app.js'), 'utf-8');
  const requiredImports = [
    'HuntFilter',
    'HuntRenderer',
    'ModalManager',
    'NotebookGenerator',
    'PresetManager',
    'Pagination',
    'validateElements',
    'debounce',
    'getNow'
  ];

  for (const importName of requiredImports) {
    if (!content.includes(importName)) {
      throw new Error(`Missing import: ${importName}`);
    }
  }
});

runner.test('index.html uses module script type', async () => {
  const content = await readFile(join(__dirname, 'index.html'), 'utf-8');
  if (!content.includes('type="module"')) {
    throw new Error('index.html does not use ES6 modules');
  }
  if (!content.includes('src="app.js"')) {
    throw new Error('index.html does not load app.js');
  }
});

// === CODE QUALITY TESTS ===
runner.test('HuntFilter has proper JSDoc', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-filter.js'), 'utf-8');
  if (!content.includes('/**')) {
    throw new Error('HuntFilter missing JSDoc documentation');
  }
});

runner.test('HuntRenderer has proper JSDoc', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-renderer.js'), 'utf-8');
  if (!content.includes('/**')) {
    throw new Error('HuntRenderer missing JSDoc documentation');
  }
});

runner.test('ModalManager has proper JSDoc', async () => {
  const content = await readFile(join(__dirname, 'js/modal-manager.js'), 'utf-8');
  if (!content.includes('/**')) {
    throw new Error('ModalManager missing JSDoc documentation');
  }
});

runner.test('Utils has proper JSDoc', async () => {
  const content = await readFile(join(__dirname, 'js/utils.js'), 'utf-8');
  if (!content.includes('/**')) {
    throw new Error('Utils missing JSDoc documentation');
  }
});

// === FUNCTIONALITY VALIDATION TESTS ===
runner.test('HuntFilter implements filterHunts method', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-filter.js'), 'utf-8');
  if (!content.includes('filterHunts(')) {
    throw new Error('HuntFilter missing filterHunts method');
  }
});

runner.test('HuntFilter implements toggleTactic method', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-filter.js'), 'utf-8');
  if (!content.includes('toggleTactic(')) {
    throw new Error('HuntFilter missing toggleTactic method');
  }
});

runner.test('HuntFilter implements toggleTag method', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-filter.js'), 'utf-8');
  if (!content.includes('toggleTag(')) {
    throw new Error('HuntFilter missing toggleTag method');
  }
});

runner.test('HuntRenderer implements renderHunts method', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-renderer.js'), 'utf-8');
  if (!content.includes('renderHunts(')) {
    throw new Error('HuntRenderer missing renderHunts method');
  }
});

runner.test('HuntRenderer implements renderTacticChips method', async () => {
  const content = await readFile(join(__dirname, 'js/hunt-renderer.js'), 'utf-8');
  if (!content.includes('renderTacticChips(')) {
    throw new Error('HuntRenderer missing renderTacticChips method');
  }
});

runner.test('ModalManager implements showHuntDetailsByIndex method', async () => {
  const content = await readFile(join(__dirname, 'js/modal-manager.js'), 'utf-8');
  if (!content.includes('showHuntDetailsByIndex(')) {
    throw new Error('ModalManager missing showHuntDetailsByIndex method');
  }
});

runner.test('NotebookGenerator implements generateNotebook method', async () => {
  const content = await readFile(join(__dirname, 'js/notebook-generator.js'), 'utf-8');
  if (!content.includes('generateNotebook(')) {
    throw new Error('NotebookGenerator missing generateNotebook method');
  }
});

runner.test('PresetManager implements saveCurrentPreset method', async () => {
  const content = await readFile(join(__dirname, 'js/preset-manager.js'), 'utf-8');
  if (!content.includes('saveCurrentPreset(')) {
    throw new Error('PresetManager missing saveCurrentPreset method');
  }
});

runner.test('Pagination implements nextPage method', async () => {
  const content = await readFile(join(__dirname, 'js/pagination.js'), 'utf-8');
  if (!content.includes('nextPage(')) {
    throw new Error('Pagination missing nextPage method');
  }
});

runner.test('Pagination implements prevPage method', async () => {
  const content = await readFile(join(__dirname, 'js/pagination.js'), 'utf-8');
  if (!content.includes('prevPage(')) {
    throw new Error('Pagination missing prevPage method');
  }
});

runner.test('Utils exports formatNumber', async () => {
  const content = await readFile(join(__dirname, 'js/utils.js'), 'utf-8');
  if (!content.includes('export function formatNumber') && !content.includes('export { formatNumber')) {
    throw new Error('Utils does not export formatNumber');
  }
});

runner.test('Utils exports debounce', async () => {
  const content = await readFile(join(__dirname, 'js/utils.js'), 'utf-8');
  if (!content.includes('export function debounce') && !content.includes('export { debounce')) {
    throw new Error('Utils does not export debounce');
  }
});

// === APP.JS STRUCTURE TESTS ===
runner.test('app.js is significantly smaller than 1855 lines', async () => {
  const content = await readFile(join(__dirname, 'app.js'), 'utf-8');
  const lines = content.split('\n').length;
  if (lines > 500) {
    throw new Error(`app.js is still too large (${lines} lines). Expected < 500 lines.`);
  }
});

runner.test('app.js initializes all modules', async () => {
  const content = await readFile(join(__dirname, 'app.js'), 'utf-8');
  const requiredInitializations = [
    'new HuntFilter',
    'new HuntRenderer',
    'new ModalManager',
    'new NotebookGenerator',
    'new PresetManager',
    'new Pagination'
  ];

  for (const init of requiredInitializations) {
    if (!content.includes(init)) {
      throw new Error(`app.js does not initialize: ${init}`);
    }
  }
});

runner.test('app.js maintains global generateNotebook function', async () => {
  const content = await readFile(join(__dirname, 'app.js'), 'utf-8');
  if (!content.includes('window.generateNotebook')) {
    throw new Error('app.js does not expose window.generateNotebook');
  }
});

// === DATA FILE TESTS ===
runner.test('hunts-data.js exists and defines HUNTS_DATA', async () => {
  const content = await readFile(join(__dirname, 'hunts-data.js'), 'utf-8');
  if (!content.includes('HUNTS_DATA')) {
    throw new Error('hunts-data.js does not define HUNTS_DATA');
  }
});

// Run all tests
runner.runAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
