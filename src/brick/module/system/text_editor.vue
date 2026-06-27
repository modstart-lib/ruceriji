<template>
  <view class="bg-white min-h-screen">
    <c-page-header
      :title="title"
      title-align="center"
      :has-action="false"
      :custom-back-callback="true"
      auto-height
      @back="doCancel"
    />
    <view class="p-4">
      <uni-easyinput v-model="value" type="textarea" auto-height :placeholder="placeholder"></uni-easyinput>
    </view>
    <view class="p-4 fixed bottom-0 left-0 right-0 border-t border-body-line">
      <view
        class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
        @click="doConfirm"
      >
        {{ submitText }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { Starter } from '@/brick/BrickUni'

import { reactive, toRefs } from 'vue'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { useUi } from '@/brick/composables/useBaseStore'

defineOptions({ name: 'TextEditor' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  title: '加载中...',
  submitText: '加载中...',
  placeholder: '输入内容...',
})
const { title, submitText, placeholder } = toRefs(state)

function init() {
  state.title = config.value.title || '发表内容'
  state.submitText = config.value.submitText || '确认提交'
}

function onInput(e) {
  value.value = e.detail.value
}

function doConfirm() {
  callbackConfirm(value.value)
}

function doCancel() {
  callbackCancel()
}

onReady(() => {
  Starter.boot(() => {
    const _waitInit = () => {
      if (!isInit.value) {
        setTimeout(_waitInit, 10)
        return
      }
      init()
    }
    _waitInit()
  })
})
</script>
