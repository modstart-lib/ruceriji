<template>
  <view class="px-1 pb-2 relative">
    <!-- 未勾选协议时用透明遮罩接管点击，统一走 checkAgree 提示 -->
    <view v-if="needAgree && !agreeChecked" class="absolute inset-0" style="z-index: 10" @tap="emit('agree')" />
    <button
      class="w-full after:border-none"
      hover-class="opacity-80"
      :style="[
        'height:48px;line-height:48px;border-radius:24px;border:none;background:#07C160;padding:0;',
        needAgree && !agreeChecked ? 'opacity:0.4' : '',
      ]"
      @tap="emit('login')"
    >
      <view class="flex flex-row items-center justify-center" style="height: 48px">
        <icon-lucide-message-circle :size="18" color="#ffffff" />
        <text class="login-btn-text">微信一键登录</text>
      </view>
    </button>
    <view class="text-center mt-4" @tap="emit('account')">
      <text class="text-text-secondary text-sm">账号密码登录 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginButtonsWeixin' })

defineProps({
  needAgree: { type: Boolean, default: false },
  agreeChecked: { type: Boolean, default: false },
})

const emit = defineEmits(['agree', 'login', 'account'])
</script>

<style lang="scss" scoped>
.login-btn-text {
  margin-left: 6px;
  font-size: 15px;
  font-weight: bold;
  color: var(--token-text-inverse);
}
</style>
