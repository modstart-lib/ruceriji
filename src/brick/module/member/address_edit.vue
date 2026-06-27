<template>
  <view>
    <c-page-header :title="title" :has-action="data.id > 0">
      <template #action>
        <block>
          <view v-if="data.id > 0" class="item text-danger pr-1" @click="doDelete">
            <icon-lucide-trash-2 class="mr-1" style="font-size: 0.7rem" />
            删除
          </view>
        </block>
      </template>
    </c-page-header>
    <view class="p-2">
      <view class="bg-white rounded-2xl p-3 shadow-sm">
        <view class="">
          <view class="line">
            <view class="label">姓名</view>
            <view class="field">
              <uni-easyinput v-model="data.name" placeholder="输入姓名"></uni-easyinput>
            </view>
          </view>
          <view class="line">
            <view class="label">手机</view>
            <view class="field">
              <view class="flex items-center">
                <view class="flex-grow">
                  <uni-easyinput v-model="data.phone" placeholder="输入手机"></uni-easyinput>
                </view>
                <!-- #ifdef MP-WEIXIN -->
                <view class="w-24 ml-2">
                  <bui-get-phone-number-button @change="onWechatMiniProgramPhoneNumberChange" />
                </view>
                <!-- #endif -->
              </view>
            </view>
          </view>
          <view class="line">
            <view class="label">省市区</view>
            <view class="field">
              <bui-area-china-selector v-model="data.area"></bui-area-china-selector>
            </view>
          </view>
          <view class="line">
            <view class="label">详细地址</view>
            <view class="field">
              <uni-easyinput v-model="data.detail" type="textarea" placeholder="输入详细地址"></uni-easyinput>
            </view>
          </view>
          <view class="line">
            <view class="field">
              <c-checkbox v-model="data.isDefault" class="mr-2"> 默认地址 </c-checkbox>
            </view>
          </view>
          <view class="p-4">
            <view
              class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
              @click="doSubmit"
            >
              保存
            </view>
          </view>
        </view>
      </view>
    </view>
    <u-loading-page :loading="loading" />
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { onReady } from '@dcloudio/uni-app'

import { useUi } from '@/brick/composables/useBaseStore'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { computed, reactive, toRefs } from 'vue'

defineOptions({ name: 'MemberAddressEdit' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: true,
  data: {
    id: 0,
    name: '',
    phone: '',
    area: '',
    detail: '',
    isDefault: false,
  },
})
const { loading, data } = toRefs(state)

const title = computed(() => {
  return state.data.id > 0 ? '编辑地址' : '新增地址'
})

function init() {
  state.loading = false
  state.data = Object.assign({}, state.data, value.value)
}

async function doSubmit() {
  dialog.loadingOn()
  try {
    await api.post('member_address/edit', state.data)
    dialog.loadingOff()
    callbackConfirm(null)
  } catch {
    dialog.loadingOff()
  }
}

async function doDelete() {
  dialog.loadingOn()
  try {
    await api.post('member_address/delete', { id: state.data.id })
    dialog.loadingOff()
    callbackConfirm(null)
  } catch {
    dialog.loadingOff()
  }
}

function onWechatMiniProgramPhoneNumberChange(value) {
  state.data.phone = value.phone
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
