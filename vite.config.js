import autoprefixer from 'autoprefixer'
import { createRequire } from 'module'
import path from 'path'
import tailwindcss from 'tailwindcss'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

const _require = createRequire(import.meta.url)
const uni = _require('@dcloudio/vite-plugin-uni').default
const vitePluginUniIcons = _require('./vite-plugin-uni-icons.js')
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const WeappTailwindcssDisabled = isH5 || isApp

// 移除 uview-plus u-icon 组件中硬编码的阿里云 CDN 图标字体（项目未使用 u-icon，避免 ERR_CACHE_MISS 报错）
const stripUiconFont = {
  postcssPlugin: 'strip-uicon-font',
  AtRule: {
    'font-face': (atRule) => {
      if (atRule.toString().includes('uicon-iconfont')) {
        atRule.remove()
      }
    },
  },
}
// stripUiconFont uses PostCSS 8 new API (postcssPlugin property); no .postcss = true needed

const buildTime = new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const buildVersion = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

// Injects __BUILD_TIME__ and __BUILD_VERSION__ into app-service.js output for app-plus platform
// (Vite define is not applied by the DCloud app-plus compiler)
const injectBuildTime = {
  name: 'inject-build-time',
  generateBundle(_opts, bundle) {
    for (const file of Object.values(bundle)) {
      if (file.type === 'chunk' && file.code) {
        file.code = file.code.replace(/__BUILD_TIME__/g, JSON.stringify(buildTime))
        file.code = file.code.replace(/__BUILD_VERSION__/g, JSON.stringify(buildVersion))
      }
    }
  },
}

// 移除 uni-h5 框架注入的 shadow-preload 预加载动画（引用不可访问的 dcloud CDN，且项目未使用 navigationBarShadow）
const stripShadowPreload = {
  name: 'strip-shadow-preload',
  enforce: 'post',
  transform(code, id) {
    if (id.includes('@dcloudio/uni-h5') && id.endsWith('shadow.css')) {
      return { code: '', map: null }
    }
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BUILD_TARGET === 'publish-pro' ? '/__X_BASE_X__/' : '/',
  server: {
    port: 21000,
    strictPort: false,
    proxy: {
      '/api/': {
        target: 'https://ruceriji.com',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    stripShadowPreload,
    injectBuildTime,
    vitePluginUniIcons(),
    uni(),
    // uvtw 一定要放在 uni 后面；disabled 时在 H5/App 平台跳过转换
    uvtw({
      disabled: WeappTailwindcssDisabled,
    }),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  css: {
    // 内联 PostCSS 注册 tailwindcss（确保 tailwindcss JIT 正确扫描文件并生效）
    postcss: {
      plugins: [tailwindcss(), autoprefixer(), stripUiconFont],
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
})
