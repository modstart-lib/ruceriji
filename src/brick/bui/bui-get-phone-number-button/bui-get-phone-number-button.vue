<template>
  <view>
    <button
      class="flex w-full items-center justify-center py-0.5 px-3 text-xs rounded-full cursor-pointer btn-primary-line"
      open-type="getPhoneNumber"
      @getphonenumber="onGetPhoneNumber"
    >
      {{ title }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'

defineOptions({ name: 'BuiGetPhoneNumberButton' })

const props = defineProps({
  title: {
    type: String,
    default: '获取已绑定手机号',
  },
})

const emit = defineEmits(['change'])

async function onGetPhoneNumber(e) {
  if (e.detail.code) {
    const res = await api.post('oauth/login_wechat_mini_program_get_phone_number', { code: e.detail.code })
    emit('change', res.data)
  }
}
</script>
