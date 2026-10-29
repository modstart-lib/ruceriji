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
        'text-secondary': 'var(--token-text-secondary)',
        'text-tertiary': 'var(--token-text-tertiary)',
        'text-disabled': 'var(--token-text-disabled)',
        info: 'var(--token-info)',
        'info-bg': 'var(--token-info-bg)',
        'warning-bg': 'var(--token-warning-bg)',
        'warning-text': 'var(--token-warning-text)',
        'success-bg': 'var(--token-success-bg)',
        'success-text': 'var(--token-success-text)',
        'chip-bg': 'var(--token-chip-bg)',
        // 旧别名保留，值统一到语义 token（#bbbbbb / #999999 不达 4.5:1）
        danger: 'var(--token-error)',
        muted: 'var(--token-text-secondary)',
        tertiary: 'var(--token-text-secondary)',
        'content-bg': 'var(--color-content-bg)',
        'body-line': '#f0f0f0',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        float: 'var(--shadow-float)',
        cta: 'var(--shadow-cta)',
        bar: 'var(--shadow-bar)',
        chip: 'var(--shadow-chip)',
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
