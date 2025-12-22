/**
 * Unit tests for JavaScript error classes
 *
 * Run with: node tests/unit/test_errors_js.mjs
 */

import assert from 'assert';
import {
  HearthError,
  ParsingError,
  ValidationError,
  APIError,
  FilterError,
  RenderError,
  NetworkError,
  getUserFriendlyMessage,
  logError
} from '../../js/errors.js';

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 JavaScript Error Classes Test Suite\n');
    console.log('='.repeat(60));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✓ ${name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        if (error.stack) {
          console.log(`  Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed, ${this.tests.length} total`);
    console.log('='.repeat(60) + '\n');

    process.exit(this.failed > 0 ? 1 : 0);
  }
}

const runner = new TestRunner();

// Test HearthError base class
runner.test('HearthError creates with default error code', () => {
  const error = new HearthError('Test error');
  assert.strictEqual(error.errorCode, 'HE-0000');
  assert.ok(error.message.includes('[HE-0000]'));
  assert.ok(error.message.includes('Test error'));
});

runner.test('HearthError creates with custom error code', () => {
  const error = new HearthError('Custom error', 'HE-9999');
  assert.strictEqual(error.errorCode, 'HE-9999');
  assert.ok(error.message.includes('[HE-9999]'));
});

runner.test('HearthError creates with context', () => {
  const context = { field: 'username', value: 'test' };
  const error = new HearthError('Error with context', 'HE-0001', context);
  assert.deepStrictEqual(error.context, context);
  assert.strictEqual(error.errorCode, 'HE-0001');
});

runner.test('HearthError toString includes context', () => {
  const error = new HearthError('Test', 'HE-0001', { foo: 'bar' });
  const str = error.toString();
  assert.ok(str.includes('HearthError'));
  assert.ok(str.includes('[HE-0001]'));
  assert.ok(str.includes('foo'));
});

runner.test('HearthError toJSON returns all properties', () => {
  const error = new HearthError('Test', 'HE-0001', { key: 'value' });
  const json = error.toJSON();
  assert.strictEqual(json.name, 'HearthError');
  assert.strictEqual(json.errorCode, 'HE-0001');
  assert.deepStrictEqual(json.context, { key: 'value' });
  assert.ok(json.stack);
});

// Test ParsingError
runner.test('ParsingError creates with default error code', () => {
  const error = new ParsingError('Parse failed');
  assert.strictEqual(error.errorCode, 'HE-1000');
  assert.ok(error instanceof HearthError);
  assert.ok(error instanceof ParsingError);
});

runner.test('ParsingError includes source in context', () => {
  const error = new ParsingError('JSON parse failed', { source: 'JSON' });
  assert.strictEqual(error.context.source, 'JSON');
});

runner.test('ParsingError includes line and column', () => {
  const error = new ParsingError('Parse error', {
    line: 42,
    column: 10,
    source: 'Markdown'
  });
  assert.strictEqual(error.context.line, 42);
  assert.strictEqual(error.context.column, 10);
  assert.strictEqual(error.context.source, 'Markdown');
});

runner.test('ParsingError truncates long content', () => {
  const longContent = 'x'.repeat(200);
  const error = new ParsingError('Parse error', { content: longContent });
  assert.ok(error.context.content.length <= 100);
});

// Test ValidationError
runner.test('ValidationError creates with default error code', () => {
  const error = new ValidationError('Validation failed');
  assert.strictEqual(error.errorCode, 'HE-2000');
  assert.ok(error instanceof HearthError);
});

runner.test('ValidationError includes field in context', () => {
  const error = new ValidationError('Invalid field', { field: 'email' });
  assert.strictEqual(error.context.field, 'email');
});

runner.test('ValidationError includes value and expected', () => {
  const error = new ValidationError('Invalid email', {
    field: 'email',
    value: 'notanemail',
    expected: 'valid email format'
  });
  assert.strictEqual(error.context.field, 'email');
  assert.strictEqual(error.context.value, 'notanemail');
  assert.strictEqual(error.context.expected, 'valid email format');
});

// Test APIError
runner.test('APIError creates with default error code', () => {
  const error = new APIError('API request failed');
  assert.strictEqual(error.errorCode, 'HE-3000');
  assert.ok(error instanceof HearthError);
});

runner.test('APIError includes endpoint and status code', () => {
  const error = new APIError('Request failed', {
    endpoint: '/api/hunts',
    statusCode: 404,
    method: 'GET'
  });
  assert.strictEqual(error.context.endpoint, '/api/hunts');
  assert.strictEqual(error.context.statusCode, 404);
  assert.strictEqual(error.context.method, 'GET');
});

runner.test('APIError includes retry information', () => {
  const error = new APIError('Rate limited', {
    statusCode: 429,
    retryAfter: 60
  });
  assert.strictEqual(error.context.statusCode, 429);
  assert.strictEqual(error.context.retryAfter, 60);
});

// Test FilterError
runner.test('FilterError creates with default error code', () => {
  const error = new FilterError('Filter failed');
  assert.strictEqual(error.errorCode, 'HE-5000');
  assert.ok(error instanceof HearthError);
});

runner.test('FilterError includes filter type and value', () => {
  const error = new FilterError('Invalid filter', {
    filterType: 'tactic',
    filterValue: 'InvalidTactic'
  });
  assert.strictEqual(error.context.filterType, 'tactic');
  assert.strictEqual(error.context.filterValue, 'InvalidTactic');
});

runner.test('FilterError includes operation', () => {
  const error = new FilterError('Filter failed', {
    filterType: 'tag',
    operation: 'toggle'
  });
  assert.strictEqual(error.context.filterType, 'tag');
  assert.strictEqual(error.context.operation, 'toggle');
});

// Test RenderError
runner.test('RenderError creates with default error code', () => {
  const error = new RenderError('Render failed');
  assert.strictEqual(error.errorCode, 'HE-6000');
  assert.ok(error instanceof HearthError);
});

runner.test('RenderError includes component and operation', () => {
  const error = new RenderError('Failed to render card', {
    component: 'hunt-card',
    operation: 'card'
  });
  assert.strictEqual(error.context.component, 'hunt-card');
  assert.strictEqual(error.context.operation, 'card');
});

runner.test('RenderError includes hunt ID', () => {
  const error = new RenderError('Render failed', {
    huntId: 'FL-001',
    component: 'modal'
  });
  assert.strictEqual(error.context.huntId, 'FL-001');
  assert.strictEqual(error.context.component, 'modal');
});

// Test NetworkError
runner.test('NetworkError creates with default error code', () => {
  const error = new NetworkError('Network request failed');
  assert.strictEqual(error.errorCode, 'HE-9000');
  assert.ok(error instanceof HearthError);
});

runner.test('NetworkError includes URL and timeout', () => {
  const error = new NetworkError('Connection timeout', {
    url: 'https://example.com/api',
    timeout: 5000,
    method: 'POST'
  });
  assert.strictEqual(error.context.url, 'https://example.com/api');
  assert.strictEqual(error.context.timeout, 5000);
  assert.strictEqual(error.context.method, 'POST');
});

// Test helper functions
runner.test('getUserFriendlyMessage strips error code', () => {
  const error = new HearthError('User-friendly message', 'HE-0001');
  const friendly = getUserFriendlyMessage(error);
  assert.ok(!friendly.includes('[HE-0001]'));
  assert.ok(friendly.includes('User-friendly message'));
});

runner.test('getUserFriendlyMessage handles non-HEARTH errors', () => {
  const error = new Error('Standard error');
  const friendly = getUserFriendlyMessage(error);
  assert.strictEqual(friendly, 'Standard error');
});

runner.test('getUserFriendlyMessage handles errors without message', () => {
  const error = new Error();
  const friendly = getUserFriendlyMessage(error);
  assert.strictEqual(friendly, 'An unexpected error occurred');
});

runner.test('logError handles HearthError correctly', () => {
  const error = new HearthError('Test error', 'HE-0001', { key: 'value' });
  // Just verify it doesn't throw
  assert.doesNotThrow(() => logError(error, 'info'));
});

runner.test('logError handles standard errors', () => {
  const error = new Error('Standard error');
  // Just verify it doesn't throw
  assert.doesNotThrow(() => logError(error));
});

// Test inheritance chain
runner.test('Error inheritance chain is correct', () => {
  const error = new ParsingError('Test');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof HearthError);
  assert.ok(error instanceof ParsingError);
  assert.strictEqual(error.name, 'ParsingError');
});

runner.test('All error classes have correct names', () => {
  assert.strictEqual(new HearthError('').name, 'HearthError');
  assert.strictEqual(new ParsingError('').name, 'ParsingError');
  assert.strictEqual(new ValidationError('').name, 'ValidationError');
  assert.strictEqual(new APIError('').name, 'APIError');
  assert.strictEqual(new FilterError('').name, 'FilterError');
  assert.strictEqual(new RenderError('').name, 'RenderError');
  assert.strictEqual(new NetworkError('').name, 'NetworkError');
});

// Run all tests
runner.run();
