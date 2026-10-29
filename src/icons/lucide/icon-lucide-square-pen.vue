<template>
  <!-- #ifdef H5 -->
  <span class="lucide-icon" v-html="_h5svg" :style="_sty" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="lucide-icon lucide-icon-mp" :style="_mpsty" />
  <!-- #endif -->
</template>
<script setup>
import { computed } from 'vue'
import { resolveIconColor } from './_token-colors.js'
const props = defineProps({
  color: { type: String, default: '' },
  size: { default: '1em' },
})
const _tpl = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\"/></g></svg>"
const _mp = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\"/></g></svg>"
const _urldef = '%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M12%203H5a2%202%200%200%200-2%202v14a2%202%200%200%200%202%202h14a2%202%200%200%200%202-2v-7%22%2F%3E%3Cpath%20d%3D%22M18.375%202.625a1%201%200%200%201%203%203l-9.013%209.014a2%202%200%200%201-.853.505l-2.873.84a.5.5%200%200%201-.62-.62l.84-2.873a2%202%200%200%201%20.506-.852z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E'
const _sz = computed(() => typeof props.size === 'number' ? props.size + 'px' : props.size || '1em')
const _sty = computed(() => `width:${_sz.value};height:${_sz.value}`)
const _h5svg = computed(() => props.color ? _tpl.replace(/currentColor/g, props.color) : _tpl)
// 小程序端背景图里的 SVG 解析不了 var(--token-x)，先换算成具体色值
const _mpcolor = computed(() => resolveIconColor(props.color))
const _url = computed(() => _mpcolor.value ? encodeURIComponent(_mp.replace(/currentColor/g, _mpcolor.value)) : _urldef)
const _mpsty = computed(() => `width:${_sz.value};height:${_sz.value};background-image:url("data:image/svg+xml,${_url.value}")`)
</script>
<style>
.lucide-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  line-height: 0;
}
/* H5 内联 SVG 必须块级铺满：父容器若带 line-height（如按钮的 48px），
   inline 的 svg 会按父级行高落基线，图标整体下沉数像素 */
.lucide-icon > svg {
  display: block;
  width: 100%;
  height: 100%;
}
.lucide-icon-mp {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
