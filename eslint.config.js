const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores(['.expo/**', 'coverage/**', 'dist/**', 'work/**', 'outputs/**']),
  expoConfig,
  prettierRecommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react/*',
            'react-native',
            'react-native/*',
            'expo',
            'expo-*',
            '@/features/*/data/*',
            '@/features/*/presentation/*',
            '@/shared/http/*',
            '@/shared/storage/*',
          ],
        },
      ],
    },
  },
]);
