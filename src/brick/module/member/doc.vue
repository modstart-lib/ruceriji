<template>
  <view class="pb-member-doc">
    <c-page-header :title="title" />
    <c-loading v-if="loading" page />
    <view v-else class="bg-white p-4" style="min-height: 100vh">
      <rich-text class="text-sm leading-relaxed" :nodes="data.content || ''" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, toRefs } from 'vue'

defineOptions({ name: 'Doc' })

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: true,
  data: {
    type: null,
    title: '',
    content: '',
  },
})
const { loading, data } = toRefs(state)

const title = computed(() => {
  if (state.loading) {
    return '正在加载...'
  }
  return state.data.title
})

async function init() {
  state.loading = true
  dialog.loadingOn()
  const res = await api.post('member_doc/get', { type: router.getQuery('type') })
  state.loading = false
  dialog.loadingOff()
  state.data = res.data
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>

<style lang="less">
.pb-member-doc {
  .cover {
    .image {
      width: 100%;
    }
  }

  .content {
  }
}
</style>
