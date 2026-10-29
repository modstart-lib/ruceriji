<template>
  <view class="px-1 pb-2 relative">
    <view v-if="needAgree && !agreeChecked" class="absolute inset-0" style="z-index: 10" @tap="emit('agree')" />
    <button
      v-if="isWechatInstalled"
      class="w-full after:border-none"
      hover-class="opacity-80"
      :style="[
        'height:48px;line-height:48px;border-radius:24px;border:none;background:#07C160;padding:0;',
        needAgree && !agreeChecked ? 'opacity:0.4' : '',
      ]"
      @tap="emit('login-wechat')"
    >
      <view class="flex flex-row items-center justify-center" style="height: 48px">
        <icon-lucide-message-circle :size="18" color="#ffffff" />
        <text class="login-btn-text">微信登录</text>
      </view>
    </button>
    <!-- Apple 登录是 App Store 审核要求，仅 iOS 显示 -->
    <button
      v-if="isIos"
      class="w-full after:border-none mt-3"
      hover-class="opacity-80"
      :style="[
        'height:48px;line-height:48px;border-radius:24px;border:none;background:#000000;padding:0;',
        needAgree && !agreeChecked ? 'opacity:0.4' : '',
      ]"
      @tap="emit('login-apple')"
    >
      <view class="flex flex-row items-center justify-center" style="height: 48px">
        <icon-lucide-apple :size="18" color="#ffffff" />
        <text class="login-btn-text">Apple 登录</text>
      </view>
    </button>
    <button class="w-full after:border-none mt-3 login-account-btn" hover-class="opacity-80" @tap="emit('account')">
      <view class="flex flex-row items-center justify-center" style="height: 48px">
        <icon-lucide-user :size="18" color="#111111" />
        <text class="login-btn-text login-account-text">账号密码登录</text>
      </view>
    </button>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginButtonsApp' })

defineProps({
  needAgree: { type: Boolean, default: false },
  agreeChecked: { type: Boolean, default: false },
  isWechatInstalled: { type: Boolean, default: false },
  isIos: { type: Boolean, default: false },
})

const emit = defineEmits(['agree', 'login-wechat', 'login-apple', 'account'])
</script>

<style lang="scss" scoped>
.login-btn-text {
  margin-left: 6px;
  font-size: 15px;
  font-weight: bold;
  color: var(--token-text-inverse);
}

.login-account-btn {
  height: 48px;
  line-height: 48px;
  padding: 0;
  border-radius: 24px;
  border: 1px solid var(--token-primary-200);
  background: var(--token-surface);
}

.login-account-text {
  color: var(--token-text);
}
</style>
