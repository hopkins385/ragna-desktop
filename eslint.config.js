// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off'
    },
    plugins: {
      'typescript-eslint': tseslint.plugin
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.web.json', './tsconfig.node.json'],
        extraFileExtensions: ['.vue'],
        sourceType: 'module'
      }
    }
  },
  eslintConfigPrettier
);
