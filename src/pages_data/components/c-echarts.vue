<template>
  <UniEcharts :option="option" :custom-style="{ width: '100%', height: `${height}px` }" />
</template>

<script setup lang="ts">
import * as echarts from './echarts/echarts.esm.min.js'
import { provideEcharts } from './xiaohe-echarts/shared-core.js'
import UniEcharts from './xiaohe-echarts/components/uni-echarts/uni-echarts.vue'

provideEcharts(echarts)

const { option, height = 200 } = defineProps<{
  option: object
  height?: number
}>()
</script>
