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
