<template>
  <c-modal ref="modalRef" title="欢迎登录" width="82%">
    <view class="pb-2">
      <!-- 顶部品牌区 -->
      <view class="flex flex-col items-center py-4">
        <view class="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3">
          <icon-lucide-sparkles :size="28" color="#ffffff" />
        </view>
        <text class="text-sm text-text-secondary">登录后享受更多功能</text>
      </view>
      <!-- 平台分支用条件编译隔离：微信小程序包里不会编译 App 的按钮，反之亦然 -->
      <!-- #ifdef MP-WEIXIN -->
      <LoginButtonsWeixin
        :need-agree="needAgree"
        :agree-checked="agreeChecked"
        @agree="checkAgree"
        @login="doWechatMiniProgramLogin"
        @account="doLoginAccount"
      />
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <LoginButtonsApp
        :need-agree="needAgree"
        :agree-checked="agreeChecked"
        :is-wechat-installed="isWechatInstalled"
        :is-ios="isIos"
        @agree="checkAgree"
        @login-wechat="doWechatLogin"
        @login-apple="doAppleLogin"
        @account="doLoginAccount"
      />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <!-- 仅为开发期模拟引入（?sim-platform=mp-weixin|app），生产 H5 不渲染 -->
      <LoginButtonsSim
        :need-agree="needAgree"
        :agree-checked="agreeChecked"
        :is-wechat-installed="isWechatInstalled"
        :is-ios="isIos"
        @agree="checkAgree"
        @login-weixin="doWechatMiniProgramLogin"
        @login-app="doWechatLogin"
        @login-apple="doAppleLogin"
        @account="doLoginAccount"
      />
      <!-- #endif -->
      <!-- 协议区 -->
      <view v-if="config.Member_AgreementEnable || config.Member_PrivacyEnable" class="pt-3 pb-1 px-1">
        <view class="flex flex-row flex-wrap items-center">
          <u-checkbox-group
            :model-value="agreeChecked ? ['1'] : []"
            @change="(val) => (agreeChecked = val.includes('1'))"
          >
            <u-checkbox name="1" :size="18" shape="circle" active-color="var(--color-primary)"></u-checkbox>
          </u-checkbox-group>
          <text class="text-xs text-text-secondary" @tap="agreeChecked = !agreeChecked">我已阅读并同意</text>
          <c-smart-link
            v-if="config.Member_AgreementEnable"
            class="text-primary"
            to="/brick/module/member/doc?type=agreement"
          >
            <text class="text-xs text-primary">《{{ config.Member_AgreementTitle }}》</text>
          </c-smart-link>
          <c-smart-link
            v-if="config.Member_PrivacyEnable"
            class="text-primary"
            to="/brick/module/member/doc?type=privacy"
          >
            <text class="text-xs text-primary">《{{ config.Member_PrivacyTitle }}》</text>
          </c-smart-link>
        </view>
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { useConfig } from '@/brick/composables/useBaseStore'
import { registerLoginDialog, unregisterLoginDialog } from '@/brick/composables/useLoginDialog'
import { dialog } from '@/brick/lib/dialog'
import { useLoginDialogPlatform } from '@/brick/lib/platform'
import { router } from '@/brick/lib/router'
import { useOauthLogin } from '@/brick/composables/useOauthLogin'
import { computed, onMounted, onUnmounted, ref } from 'vue'
// 条件编译引入：各端包里只保留自己那套按钮
// #ifdef MP-WEIXIN
import LoginButtonsWeixin from './components/LoginButtonsWeixin.vue'
// #endif
// #ifdef APP-PLUS
import LoginButtonsApp from './components/LoginButtonsApp.vue'
// #endif
// #ifdef H5
import LoginButtonsSim from './components/LoginButtonsSim.vue'
// #endif

defineOptions({ name: 'BuiMemberLoginDialog' })

const { config } = useConfig()

const modalRef = ref<any>(null)
const agreeChecked = ref(false)

const needAgree = computed(() => !!(config.value.Member_AgreementEnable || config.value.Member_PrivacyEnable))

// 模块级变量存储上下文（避免 reactive 导致的小程序报错）
let thisCtx: any = null
let thisSuccessCallback: (() => void) | null = null
let myRoute = ''

/** 微信小程序 / App 才用弹窗登录，其余平台由调用方降级到登录页 */
const support = computed(() => useLoginDialogPlatform())

const { isIos, isWechatInstalled, doWechatMiniProgramLoginProcess, doWechatLogin, doAppleLogin } = useOauthLogin({
  beforeLogin: () => checkAgree(),
  onSuccess: () => {
    modalRef.value.close()
    thisSuccessCallback && thisSuccessCallback()
  },
  onWechatFallback: () => doLoginAccount(),
})

function show(ctx, successCallback) {
  // 这种情况微信小程序会报错
  // state.ctx = Object.freeze(ctx)
  // state.successCallback = successCallback
  thisCtx = ctx
  thisSuccessCallback = successCallback
  modalRef.value.show()
}

onMounted(() => {
  myRoute = (getCurrentPages()[getCurrentPages().length - 1] as any)?.route || ''
  registerLoginDialog(myRoute, {
    get support() {
      return support.value
    },
    show,
  })
})
onUnmounted(() => unregisterLoginDialog(myRoute))

function doLoginAccount() {
  if (!checkAgree()) return
  modalRef.value.close()
  router.to('/brick/module/member/login')
}

function checkAgree() {
  if ((config.value.Member_AgreementEnable || config.value.Member_PrivacyEnable) && !agreeChecked.value) {
    dialog.tipError('请先阅读并同意用户协议及隐私政策')
    return false
  }
  return true
}

function doWechatMiniProgramLogin() {
  if (!checkAgree()) return
  doWechatMiniProgramLoginProcess((res) => {
    modalRef.value.close()
    thisSuccessCallback && thisSuccessCallback()
  })
}
</script>

<style lang="less" scoped>
.bui-member-login-dialog {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;

  .content {
    margin: 0 auto;
    background: var(--color-body-bg);
    border-radius: 0.5rem;
    padding: 1rem;
    position: relative;

    .close {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: var(--color-body-bg);
      width: 1.5rem;
      height: 1.5rem;
      line-height: 1.5rem;
      text-align: center;
      border-radius: 50%;
      box-shadow: 0 0 5px #999;
    }
  }
}
</style>
