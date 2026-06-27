<template>
  <c-modal ref="modalRef" title="我的成就" width="90%">
    <view v-if="award" class="px-4 py-8">
      <view class="p-2 w-44 mx-auto">
        <c-cover :src="award.cover" background-color="transparent" />
      </view>
      <view class="font-bold text-xl text-center mt-4">{{ award.title }}</view>
      <view class="text-center text-muted mt-2">{{ award.summary }}</view>
      <view class="mt-6">
        <u-button type="primary" shape="circle" :block="true" @click="close">
          <icon-lucide-check :size="20" color="#fff" />
          <text class="ml-2">我知道了</text>
        </u-button>
      </view>
      <view
        class="mt-4 flex justify-center items-center text-tertiary text-sm"
        @click="router.to('/pages/award/index')"
      >
        <text class="mr-1">查看全部</text>
        <icon-lucide-chevron-right :size="14" />
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { useAppBiz, useAppUser } from '@/brick/composables/useAppStore'
import { api } from '@/brick/lib/api'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { onMounted, reactive, ref, toRefs } from 'vue'

defineOptions({ name: 'AppAwardDetectDialog' })

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { biz } = useAppBiz()

const state = reactive({
  award: null,
  timer: null,
})
const { award, timer } = toRefs(state)

const modalRef = ref<any>(null)

function show() {
  modalRef.value && modalRef.value.show()
}

function close() {
  modalRef.value && modalRef.value.close()
}

function autoDetect() {
  if (state.timer) clearTimeout(state.timer)
  state.timer = setTimeout(() => {
    waitUserReady(async () => {
      if (user.value && user.value.id > 0) {
        try {
          const res = await api.post('app_award/fetch_new', {}, null, null, { silent: true })
          if (res.data.award) {
            state.award = res.data.award
            show()
          }
        } catch {}
      }
    })
  }, 1000)
}

onMounted(() => {
  autoDetect()
  EventBus.$on('UserChange', () => autoDetect())
  EventBus.$on('RecordChange', () => autoDetect())
})
</script>
