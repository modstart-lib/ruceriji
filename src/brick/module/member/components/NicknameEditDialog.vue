<template>
  <c-modal ref="modalRef" title="设置昵称" width="92%">
    <view class="mb-4">
      <view class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-3 py-2.5">
        <!-- #ifdef H5 -->
        <input v-model="data.nickname" placeholder="请输入昵称" class="w-full text-base leading-normal" />
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <input
          v-model="data.nickname"
          type="nickname"
          placeholder="请输入昵称"
          class="w-full text-base leading-normal"
        />
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <input
          v-model="data.nickname"
          type="nickname"
          placeholder="请输入昵称"
          class="w-full text-base leading-normal"
        />
        <!-- #endif -->
      </view>
    </view>
    <view class="mb-4">
      <view class="flex items-center gap-2">
        <view class="min-w-0 flex-1 rounded-lg border border-solid border-gray-200 bg-gray-50 px-3 py-2.5">
          <input v-model="data.captcha" placeholder="输入图片验证" class="w-full text-base leading-normal" />
        </view>
        <view class="w-[126px] flex-shrink-0 self-stretch flex items-center">
          <c-smart-captcha ref="captcha" height="2.25rem" src="member_profile/captcha" />
        </view>
      </view>
    </view>
    <view
      class="mb-4 box-border flex w-full min-w-0 max-w-full items-center justify-center rounded-full bg-primary py-2.5 px-5 text-base text-white"
      @click="doSubmit"
    >
      保存
    </view>
    <view class="rounded-lg border border-solid border-gray-200 p-3 text-sm">
      <view class="mb-1 font-medium text-gray-800">为什么要设置昵称？</view>
      <view class="space-y-1 text-gray-500">
        <view>保护隐私，不会暴露真实账号名称</view>
        <view>彰显个性，换掉无聊字符</view>
        <view>随时修改，想改随时更改</view>
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'

defineOptions({ name: 'NicknameEditDialog' })

const { user } = useUser()

const state = reactive({
  data: {
    nickname: '',
    captcha: '',
  },
})
const { data } = toRefs(state)

const modalRef = ref<any>(null)
const captcha = ref<any>(null)

function show() {
  state.data.nickname = user.value.nickname
  state.data.captcha = ''
  modalRef.value.show()
}

function doSubmit() {
  dialog.loadingOn()
  api.post(
    'member_profile/nickname',
    state.data,
    (res) => {
      dialog.loadingOff()
      EventBus.$emitDelay('UpdateApp')
      dialog.tipSuccess('设置成功')
      modalRef.value.close()
    },
    (res) => {
      dialog.loadingOff()
      captcha.value?.refresh()
    }
  )
}

defineExpose({ show })
</script>
