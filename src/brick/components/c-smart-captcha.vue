<template>
  <image class="pb-smart-captcha" mode="heightFix" :style="{ height: height }" :src="image" @click="refresh" />
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'
import { EventBus } from '@/brick/lib/event-bus'
import { onMounted, onUnmounted, reactive, toRefs } from 'vue'

defineOptions({ name: 'CSmartCaptcha' })

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '1.5rem',
  },
})

const state = reactive({
  image: '' as string,
  verified: false,
})
const { image, verified } = toRefs(state)

function onCaptchaError(e) {
  refresh()
}

function refresh() {
  state.image = ''
  api.post(props.src, {}).then((res) => {
    state.image = res.data.image
  })
}

onMounted(() => {
  EventBus.$on('modstart:captcha.error', onCaptchaError)
  refresh()
})

onUnmounted(() => {
  EventBus.$off('modstart:captcha.error', onCaptchaError)
})
</script>

<style lang="less" scoped>
.pb-smart-captcha {
  display: block;
  width: auto;
  max-width: 100%;
  cursor: pointer;
  border-radius: 0.25rem;
}
</style>
