import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'unpackage/**',
      '**/*.d.ts',
      // 第三方嵌入组件，不参与 lint
      'src/brick/bui/bui-image-design/xinyu-canvas-drawer/**',
      'src/pages_data/components/echarts/**',
      'src/pages_data/components/xiaohe-echarts/**',
      'src/brick/uni/uni-easyinput/**',
      'src/brick/uni/uni-icons/**',
      'src/brick/uni/uni-calendar/**',
      'src/brick/uni/uni-scss/**',
      'src/icons/**',
      'src/brick/lib/weapp-qrcode.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': ['warn', { html: { void: 'always', normal: 'always', component: 'always' } }],
      'vue/no-unused-vars': 'off',
      // UniApp 中 v-for+v-if 同时用于条件编译块内是常见模式
      'vue/no-use-v-if-with-v-for': 'off',
      // UniApp 中组件名可能与 HTML 保留名冲突（如 Frame、Search）
      'vue/no-reserved-component-names': 'off',

      // General
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-undef': 'off',
      'no-useless-assignment': 'off',
      'no-redeclare': 'off',
      'no-prototype-builtins': 'warn',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      // UniApp 条件编译（// #ifdef ... // #endif）会导致 ESLint 误报以下规则
      'no-unreachable': 'off',
      'no-constant-condition': 'off',
    },
  },
  eslintConfigPrettier,
)
