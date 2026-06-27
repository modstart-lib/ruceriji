// UniApp 多平台 Lucide 图标 Vite 插件
// H5:   <span v-html="...">  —— 内联 SVG，CSS currentColor / text-* 自动继承
// 非H5: <view :style="...">  —— background-image: url(data:image/svg+xml,...) URL 编码
// 用法: <icon-lucide-activity /> <icon-lucide-user :size="20" color="#ff0000" />

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname)
const OUT_DIR = path.join(ROOT, 'src/icons/lucide')

// IconLucideChevronRight → chevron-right
function toKebab(componentName) {
  return componentName
    .replace(/^IconLucide/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .toLowerCase()
}

function getSvg(kebabName) {
  const lucide = require('@iconify-json/lucide')
  const icons = lucide.icons
  const icon = icons.icons[kebabName]
  if (!icon) return null
  const w = icons.width || 24
  const h = icons.height || 24
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>`
}

function makeSfc(svg) {
  const svgH5 = svg.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"')
  // 构建时预计算默认颜色 URL 编码，不依赖运行时 btoa
  const urlDefault = encodeURIComponent(svg.replace(/currentColor/g, '#333333'))
  return `<template>
  <!-- #ifdef H5 -->
  <span class="lucide-icon" v-html="_h5svg" :style="_sty" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="lucide-icon lucide-icon-mp" :style="_mpsty" />
  <!-- #endif -->
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  color: { type: String, default: '' },
  size: { default: '1em' },
})
const _tpl = ${JSON.stringify(svgH5)}
const _mp = ${JSON.stringify(svg)}
const _urldef = '${urlDefault}'
const _sz = computed(() => typeof props.size === 'number' ? props.size + 'px' : props.size || '1em')
const _sty = computed(() => \`width:\${_sz.value};height:\${_sz.value}\`)
const _h5svg = computed(() => props.color ? _tpl.replace(/currentColor/g, props.color) : _tpl)
const _url = computed(() => props.color ? encodeURIComponent(_mp.replace(/currentColor/g, props.color)) : _urldef)
const _mpsty = computed(() => \`width:\${_sz.value};height:\${_sz.value};background-image:url("data:image/svg+xml,\${_url.value}")\`)
</script>
<style>
.lucide-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
.lucide-icon-mp {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
`
}

function scanUsedIcons() {
  const fg = require('fast-glob')
  const vueFiles = fg.sync('src/**/*.vue', { cwd: ROOT })
  const used = new Set()
  for (const file of vueFiles) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8')
    // kebab-case: icon-lucide-chevron-right
    for (const [, name] of content.matchAll(/\bicon-lucide-([a-z][a-z0-9-]*)/g)) {
      used.add('icon-lucide-' + name)
    }
    // PascalCase 兼容: IconLucideChevronRight → icon-lucide-chevron-right
    for (const [, suffix] of content.matchAll(/\bIconLucide([A-Za-z0-9]+)/g)) {
      used.add('icon-lucide-' + toKebab('IconLucide' + suffix))
    }
  }
  return used
}

function generate() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.vue')) fs.unlinkSync(path.join(OUT_DIR, f))
  }

  const usedIcons = scanUsedIcons()
  console.log(`[uni-icons] Scanning... found ${usedIcons.size} used icons`)

  let count = 0
  const missing = []
  for (const fullName of usedIcons) {
    const iconKebab = fullName.replace(/^icon-lucide-/, '')
    const svg = getSvg(iconKebab)
    if (!svg) { missing.push(fullName); continue }
    fs.writeFileSync(path.join(OUT_DIR, fullName + '.vue'), makeSfc(svg), 'utf8')
    count++
  }
  if (missing.length) console.warn('[uni-icons] Icons not found:', missing.join(', '))
  console.log(`[uni-icons] Generated ${count} icons → src/icons/lucide/`)
}

module.exports = function vitePluginUniIcons() {
  return {
    name: 'vite-plugin-uni-icons',
    buildStart: generate,
  }
}

module.exports.generate = generate
