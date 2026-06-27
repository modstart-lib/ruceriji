/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  prefix: '',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        // 与 src/config/token.less 语义色对齐（Tailwind 工具类）
        success: 'var(--token-success)',
        warning: 'var(--token-warning)',
        error: 'var(--token-error)',
        accent: 'var(--token-accent)',
        surface: 'var(--token-surface)',
        panel: 'var(--token-panel)',
        'token-text': 'var(--token-text)',
        danger: '#f56565',
        muted: '#bbbbbb',
        tertiary: '#999999',
        'content-bg': 'var(--color-content-bg)',
        'body-line': '#f0f0f0',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.bottom-with-tab': {
          bottom: 'var(--bottom-with-tab)',
        },
      })
    })
  ],
}
