<template>
  <c-modal ref="modalRef" title="欢迎登录" width="82%">
    <view class="pb-2">
      <!-- 顶部品牌区 -->
      <view class="flex flex-col items-center py-4">
        <view class="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3">
          <icon-lucide-sparkles :size="28" color="#ffffff" />
        </view>
        <text class="text-sm text-gray-400">登录后享受更多功能</text>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <view class="px-1 pb-2 relative">
        <view v-if="needAgree && !agreeChecked" class="absolute inset-0" style="z-index: 10" @tap="checkAgree"></view>
        <button
          class="w-full after:border-none"
          hover-class="opacity-80"
          :style="[
            'height:48px;line-height:48px;border-radius:24px;border:none;background:#07C160;padding:0;',
            needAgree && !agreeChecked ? 'opacity:0.4' : '',
          ]"
          @tap="doWechatMiniProgramLogin"
        >
          <view class="flex flex-row items-center justify-center" style="height: 48px">
            <icon-lucide-message-circle :size="18" color="#ffffff" />
            <text style="color: #ffffff; margin-left: 6px; font-size: 15px; font-weight: bold">微信一键登录</text>
          </view>
        </button>
        <view class="text-center mt-4" @tap="doLoginAccount">
          <text class="text-gray-400 text-sm">账号密码登录 →</text>
        </view>
      </view>
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <view class="px-1 pb-2 relative">
        <view v-if="needAgree && !agreeChecked" class="absolute inset-0" style="z-index: 10" @tap="checkAgree"></view>
        <button
          v-if="isWechatInstalled"
          class="w-full after:border-none"
          hover-class="opacity-80"
          :style="[
            'height:48px;line-height:48px;border-radius:24px;border:none;background:#07C160;padding:0;',
            needAgree && !agreeChecked ? 'opacity:0.4' : '',
          ]"
          @tap="doWechatLogin"
        >
          <view class="flex flex-row items-center justify-center" style="height: 48px">
            <icon-lucide-message-circle :size="18" color="#ffffff" />
            <text style="color: #ffffff; margin-left: 6px; font-size: 15px; font-weight: bold">微信登录</text>
          </view>
        </button>
        <button
          v-if="isIos"
          class="w-full after:border-none mt-3"
          hover-class="opacity-80"
          :style="[
            'height:48px;line-height:48px;border-radius:24px;border:none;background:#000000;padding:0;',
            needAgree && !agreeChecked ? 'opacity:0.4' : '',
          ]"
          @tap="doAppleLogin"
        >
          <view class="flex flex-row items-center justify-center" style="height: 48px">
            <icon-lucide-apple :size="18" color="#ffffff" />
            <text style="color: #ffffff; margin-left: 6px; font-size: 15px; font-weight: bold">Apple 登录</text>
          </view>
        </button>
        <button
          class="w-full after:border-none mt-3"
          hover-class="opacity-80"
          style="height:48px;line-height:48px;border-radius:24px;border:1px solid #d1d5db;background:#ffffff;padding:0;"
          @tap="doLoginAccount"
        >
          <view class="flex flex-row items-center justify-center" style="height: 48px">
            <icon-lucide-user :size="18" color="#374151" />
            <text style="color: #374151; margin-left: 6px; font-size: 15px; font-weight: bold">账号密码登录</text>
          </view>
        </button>
      </view>
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
          <text class="text-xs text-gray-400" @tap="agreeChecked = !agreeChecked">我已阅读并同意</text>
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
import { router } from '@/brick/lib/router'
import { useOauthLogin } from '../../module/member/components/OauthScript'
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'BuiMemberLoginDialog' })

const { config } = useConfig()

const modalRef = ref<any>(null)
const agreeChecked = ref(false)

const needAgree = computed(() => !!(config.value.Member_AgreementEnable || config.value.Member_PrivacyEnable))

// 模块级变量存储上下文（避免 reactive 导致的小程序报错）
let thisCtx: any = null
let thisSuccessCallback: (() => void) | null = null
let myRoute = ''

const support = computed(() => {
  let support = false
  // #ifdef MP-WEIXIN || APP-PLUS
  support = true
  // #endif
  return support
})

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
