import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        marked: 'readonly',
        DOMPurify: 'readonly',
        alert: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        // Application globals
        HUNTS_DATA: 'readonly',
        hearthApp: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
      'no-undef': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'max-len': ['warn', { 'code': 100, 'ignoreUrls': true, 'ignoreStrings': true }]
    }
  },
  {
    // The site's TypeScript (npm run lint). Without this block ESLint parsed
    // .ts files as plain JS and every file failed with a parsing error.
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    // src/lib is shared with the MCP server, which runs it in Node (mcp/).
    // Browser globals and Vite-only code there break the MCP build or runtime.
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'location', 'HTMLElement'].map(
          (name) => ({ name, message: 'src/lib is shared with the MCP server (Node): no DOM globals.' }),
        ),
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['vite', 'vite/*', '*.css', '*.html', '*?raw', '*?url'], message: 'src/lib is shared with the MCP server: no Vite imports.' }] },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'MetaProperty[meta.name="import"][property.name="meta"]', message: 'src/lib is shared with the MCP server: no import.meta (Vite env).' },
      ],
    },
  },
  {
    ignores: [
      'node_modules/',
      'database/',
      'Alchemy/',
      'Embers/',
      'Flames/',
      'Keepers/',
      'Kindling/',
      'Forge/',
      'Assets/',
      '.github/',
      'hunts-data.js'
    ]
  }
];
