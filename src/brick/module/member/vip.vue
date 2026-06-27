<template>
  <view>
    <VipPage />
    <app-tab-bar v-if="mode === 'tabbar'" />
  </view>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { useUser } from '@/brick/composables/useUser'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { router } from '@/brick/lib/router'
import { Starter } from '@/brick/BrickUni'
import VipPage from '@/brick/module/member/components/VipPage.vue'

defineOptions({ name: 'Vip' })

const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  // 显示模式 tabbar | null
  mode: null,
})
const { mode } = toRefs(state)

function init() {}

onReady(() => {
  state.mode = router.getQuery('mode')
  Starter.boot(() => init())
})
</script>
