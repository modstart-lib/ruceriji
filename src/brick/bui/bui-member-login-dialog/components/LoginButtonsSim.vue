<!--
  仅 H5 使用的平台模拟容器（原生端不会 import 这个文件）：
  按 ?sim-platform=mp-weixin|app 渲染对应端的按钮组，便于在 H5 里查看、截图与自动化测试。
  模拟开关见 lib/platform.ts：只在 dev 或显式 VITE_SIMULATE_PLATFORM 生效，生产 H5 永远是 h5、不渲染。

  事件按「端」分开抛：login-weixin 走小程序登录流程，login-app 走 App 微信登录流程。
-->
<template>
  <LoginButtonsWeixin
    v-if="platform === 'mp-weixin'"
    :need-agree="needAgree"
    :agree-checked="agreeChecked"
    @agree="emit('agree')"
    @login="emit('login-weixin')"
    @account="emit('account')"
  />
  <LoginButtonsApp
    v-else-if="platform === 'app'"
    :need-agree="needAgree"
    :agree-checked="agreeChecked"
    :is-wechat-installed="isWechatInstalled"
    :is-ios="isIos"
    @agree="emit('agree')"
    @login-wechat="emit('login-app')"
    @login-apple="emit('login-apple')"
    @account="emit('account')"
  />
</template>

<script setup lang="ts">
import { getRuntimePlatform } from '@/brick/lib/platform'
import LoginButtonsApp from './LoginButtonsApp.vue'
import LoginButtonsWeixin from './LoginButtonsWeixin.vue'

defineOptions({ name: 'LoginButtonsSim' })

defineProps({
  needAgree: { type: Boolean, default: false },
  agreeChecked: { type: Boolean, default: false },
  isWechatInstalled: { type: Boolean, default: false },
  isIos: { type: Boolean, default: false },
})

const emit = defineEmits(['agree', 'login-weixin', 'login-app', 'login-apple', 'account'])

/** H5 下这里是模拟值；未模拟时是 'h5'，两个按钮组都不渲染 */
const platform = getRuntimePlatform()
</script>
