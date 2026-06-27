<template>
  <view class="pb-smart-verify">
    <button
      v-if="status === 'init'"
      class="flex w-full items-center justify-center py-1 px-4 text-sm rounded-full cursor-pointer"
      :size="size"
      :style="{ height: height }"
      :disabled="loading"
      @click="send"
    >
      {{ sendText }}
    </button>
    <button
      v-if="status === 'sent'"
      class="flex w-full items-center justify-center py-1 px-4 text-sm rounded-full cursor-pointer"
      :size="size"
      :style="{ height: height }"
      :disabled="true"
    >
      {{ count }}秒
    </button>
    <button
      v-if="status === 'retry'"
      class="flex w-full items-center justify-center py-1 px-4 text-sm rounded-full cursor-pointer"
      :size="size"
      :style="{ height: height }"
      :disabled="loading"
      @click="send"
    >
      重新获取
    </button>
  </view>
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { onMounted, reactive, toRefs } from 'vue'

defineOptions({ name: 'CSmartVerify' })

const props = defineProps({
  sendText: {
    type: String,
    default: '点击获取',
  },
  src: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '',
  },
  captcha: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'large',
  },
  height: {
    type: String,
    default: 'auto',
  },
  captchaData: {
    type: Object,
    default: null,
  },
  tipSuccess: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['error'])

const state = reactive({
  loading: false,
  status: 'init', // init sent retry
  count: 0,
})
const { loading, status, count } = toRefs(state)

function countDown() {
  state.count--
  if (state.count > 0) {
    setTimeout(() => {
      countDown()
    }, 1000)
  } else {
    state.status = 'retry'
  }
}

async function send() {
  state.loading = true
  try {
    const res = await api.post(
      props.src,
      Object.assign(
        {
          target: props.target,
          captcha: props.captcha,
        },
        props.captchaData
      )
    )
    state.loading = false
    state.count = 60
    state.status = 'sent'
    countDown()
    if (props.tipSuccess && res.msg) {
      dialog.tipSuccess(res.msg)
    }
  } catch {
    state.loading = false
    emit('error')
  }
}

onMounted(() => {})
</script>

<style lang="less">
.pb-smart-verify {
  .btn {
    width: 100%;
  }
}
</style>
