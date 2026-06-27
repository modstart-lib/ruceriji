<template>
  <view>
    <xinyu-canvas-drawer ref="poster" :width="width" :height="height"></xinyu-canvas-drawer>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick, toRefs } from 'vue'
import { router } from '@/brick/lib/router'
import XinyuCanvasDrawer from './xinyu-canvas-drawer'

defineOptions({ name: 'BuiImageDesign' })

const state = reactive({
  width: 100,
  height: 100,
})
const { width, height } = toRefs(state)

const poster = ref<any>(null)

async function render(imageConfig) {
  // console.log('imageConfig', imageConfig)
  const posterInst = poster.value
  await posterInst.init()
  state.width = imageConfig.width
  state.height = imageConfig.height
  posterInst.clear()
  await posterInst.setSize(imageConfig.width, imageConfig.height)
  return new Promise((resolve, reject) => {
    nextTick(() => {
      if (imageConfig.backgroundColor) {
        posterInst.setBackgroundColor(imageConfig.backgroundColor)
      }
      for (const block of imageConfig.blocks) {
        switch (block.type) {
          case 'text':
          case 'rect':
          case 'image':
          case 'qrcode':
          case 'maskColor':
            posterInst.addBlock(block.type, block)
            break
          default:
            console.error('未知的block类型', block.type, block)
            break
        }
      }
      posterInst
        .draw()
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

defineExpose({ render })
</script>

<style scoped></style>
