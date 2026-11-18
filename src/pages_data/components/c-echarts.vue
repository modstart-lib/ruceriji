<template>
  <UniEcharts :option="option" :autoresize="true" :custom-style="{ width: '100%', height: `${height}px` }" />
</template>

<script setup lang="ts">
// Pie-only echarts bundle kept inside this subpackage, see scripts/build-echarts.mjs
import echarts from './echarts/echarts.pie.esm.js'
import { provideEcharts } from './xiaohe-echarts/shared-core.js'
import UniEcharts from './xiaohe-echarts/components/uni-echarts/uni-echarts.vue'

provideEcharts(echarts)

const { option, height = 200 } = defineProps<{
  option: object
  height?: number
}>()
</script>
