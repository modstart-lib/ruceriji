<template>
  <view>
    <!-- #ifdef APP-PLUS -->
    <c-page-header ref="header" :title="title" shadow :has-back="hasBack" :has-action="hasAction">
      <template #action>
        <block>
          <view v-if="externalOpen" @click="doOpenExternal">
            <icon-lucide-monitor class="item" style="font-size: 1rem" />
          </view>
        </block>
      </template>
    </c-page-header>
    <!-- #endif -->
    <view>
      <web-view class="web" :src="url" frameborder="0" @message="onMessage"></web-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, getCurrentInstance, toRefs } from 'vue'
import { onReady, onShow } from '@dcloudio/uni-app'
import { useUi } from '@/brick/composables/useBaseStore'
import { Starter } from '@/brick/BrickUni'
import { router } from '@/brick/lib/router'

defineOptions({ name: 'Web' })

const instance = getCurrentInstance()

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  externalOpen: false,
  url: null,
  load: false,
  messageProcessed: [],
})
const { externalOpen, url, load, messageProcessed } = toRefs(state)

const title = computed(() => {
  return getPageDefaultTitle('网页')
})

const hasBack = computed(() => {
  return true
})

const hasAction = computed(() => {
  // #ifdef APP-PLUS
  return !!state.externalOpen
  // #endif
  return false
})

function doOpenExternal() {
  // #ifdef APP-PLUS
  plus.runtime.openURL(state.url)
  // #endif
}

function onWebReady(cb) {
  // #ifdef APP-PLUS
  const currentWebview = (instance?.proxy as any).$scope.$getAppWebview()
  if (currentWebview.children()[0]) {
    cb()
  } else {
    setTimeout(() => {
      onWebReady(cb)
    }, 10)
  }
  // #endif
}

function onMessage(e) {
  console.log('onMessage', e)
  // APP-PLUS | MP-WEIXIN
  const msgs = e.detail.data
  for (let m of msgs) {
    try {
      const msg = JSON.parse(m)
      if (msg.type) {
        onProcessMessage(msg)
      }
    } catch (e) {}
  }
}

function onProcessMessage(msg) {
  console.log('onProcessMessage', JSON.stringify(msg))
  if (state.messageProcessed.indexOf(msg.id) >= 0) {
    console.log('onProcessMessage.duplicated', msg.id)
    return
  }
  state.messageProcessed.push(msg.id)
  switch (msg.type) {
  }
}

onReady(() => {
  Starter.boot()
})

onShow(() => {
  state.url = router.getQuery('url')
  state.externalOpen = router.getQuery('externalOpen')
  state.load = true
  onWebReady(() => {
    // #ifdef APP-PLUS
    const currentWebview = (instance?.proxy as any).$scope.$getAppWebview()
    const headerHeight = SystemConfig.StatusHeightRaw + SystemConfig.HeadHeight + 2
    // console.log('headerHeight',JSON.stringify({SystemConfig:SystemConfig, sysinfo, headerHeight},null,2))
    const wv = currentWebview.children()[0]
    wv.setStyle({
      top: headerHeight + 1,
      height: SystemConfig.Height - headerHeight,
      scalable: true,
    })
    // #endif
  })
})
</script>

<style lang="less">
.web {
}
</style>
