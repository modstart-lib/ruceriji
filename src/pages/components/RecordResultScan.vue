<template>
  <view v-if="loading" class="fixed inset-0" style="background-color: rgba(0, 0, 0, 0.2); z-index: 999">
    <view class="absolute top-32 left-0 right-0 text-center">
      <view
        class="animate-pulse inline-block rounded-full px-10 leading-10"
        style="background-color: var(--color-rc-primary); color: var(--color-rc-primary-text)"
      >
        正在分析...
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'

defineOptions({ name: 'RecordResultScan' })

const state = reactive({
  loading: false,
  id: 0,
})
const { loading, id } = toRefs(state)

async function start(id) {
  state.id = id
  state.loading = true
  try {
    const res = await api.post('ruceriji/record_result/request', { id: state.id })
    if (res.data.status === 'exists') {
      state.loading = false
      router.to('/pages/detail_ai', { id: state.id })
    } else {
      setTimeout(() => query(), 5000)
    }
  } catch {
    state.loading = false
  }
}

async function query() {
  try {
    const res = await api.post('ruceriji/record_result/query', { id: state.id })
    if (res.data.status === 'success') {
      state.loading = false
      router.to('/pages/detail_ai', { id: state.id })
    } else if (res.data.status === 'fail') {
      state.loading = false
      dialog.tipError(res.data.msg)
    } else {
      setTimeout(() => query(), 5000)
    }
  } catch {
    state.loading = false
  }
}

defineExpose({ start })
</script>
