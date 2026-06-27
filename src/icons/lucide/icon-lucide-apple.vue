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
const props = defineProps({
  color: { type: String, default: '' },
  size: { default: '1em' },
})
const _tpl = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12 6.528V3a1 1 0 0 1 1-1h0\"/><path d=\"M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10a3 3 0 0 0 3.648.648a5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21\"/></g></svg>"
const _mp = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12 6.528V3a1 1 0 0 1 1-1h0\"/><path d=\"M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10a3 3 0 0 0 3.648.648a5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21\"/></g></svg>"
const _urldef = '%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23333333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M12%206.528V3a1%201%200%200%201%201-1h0%22%2F%3E%3Cpath%20d%3D%22M18.237%2021A15%2015%200%200%200%2022%2011a6%206%200%200%200-10-4.472A6%206%200%200%200%202%2011a15.1%2015.1%200%200%200%203.763%2010a3%203%200%200%200%203.648.648a5.5%205.5%200%200%201%205.178%200A3%203%200%200%200%2018.237%2021%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E'
const _sz = computed(() => typeof props.size === 'number' ? props.size + 'px' : props.size || '1em')
const _sty = computed(() => `width:${_sz.value};height:${_sz.value}`)
const _h5svg = computed(() => props.color ? _tpl.replace(/currentColor/g, props.color) : _tpl)
const _url = computed(() => props.color ? encodeURIComponent(_mp.replace(/currentColor/g, props.color)) : _urldef)
const _mpsty = computed(() => `width:${_sz.value};height:${_sz.value};background-image:url("data:image/svg+xml,${_url.value}")`)
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
