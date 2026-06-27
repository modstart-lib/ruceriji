<template>
  <view>
    <view v-if="config && hasOauth" class="oauth">
      <view class="flex-1 ml-2 text-sm text-gray-700"> 您还可以使用以下方式登录 </view>
      <view class="body">
        <!-- #ifdef H5 -->
        <view v-if="config.oauthWechatMobileEnable" class="item-wrapper" @click="doOauth('wechatmobile')">
          <view class="item wechat"><icon-lucide-message-circle color="#ffffff" size="26px" /></view>
          <view class="text">微信</view>
        </view>
        <view v-if="config.oauthQQEnable" class="item-wrapper" @click="doOauth('qq')">
          <view class="item qq"><icon-lucide-user color="#ffffff" size="26px" /></view>
          <view class="text">QQ</view>
        </view>
        <view v-if="config.oauthWeiboEnable" class="item-wrapper" @click="doOauth('weibo')">
          <view class="item weibo"><icon-lucide-globe color="#ffffff" size="26px" /></view>
          <view class="text">微博</view>
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="item-wrapper btn-reset" @tap="doWechatMiniProgramLogin">
          <view class="item wechat"><icon-lucide-message-circle color="#ffffff" size="26px" /></view>
          <view class="text">微信</view>
        </button>
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <button v-if="isWechatInstalled" class="item-wrapper btn-reset" @tap="doWechatLogin">
          <view class="item wechat"><icon-lucide-message-circle color="#ffffff" size="26px" /></view>
          <view class="text">微信</view>
        </button>
        <view v-if="isIos" class="item-wrapper" @click="doAppleLogin">
          <view class="item apple"><icon-lucide-apple color="#ffffff" size="26px" /></view>
          <view class="text">苹果</view>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppUser } from '@/brick/composables/useAppStore'
import { useConfig } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EntryProcessorUtil } from '@/brick/lib/entry-processor'
import { router } from '@/brick/lib/router'
import { useOauthLogin } from './OauthScript'
import { computed } from 'vue'

defineOptions({ name: 'Oauth' })

const props = defineProps<{
  beforeLogin?: () => boolean
}>()

function checkBeforeLogin(): boolean {
  if (props.beforeLogin) return props.beforeLogin()
  return true
}

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config } = useConfig()

const { isIos, isWechatInstalled, doWechatMiniProgramLoginProcess, doWechatLogin, doAppleLogin } = useOauthLogin({
  beforeLogin: checkBeforeLogin,
  onSuccess: () => {
    const redirect = router.getQuery('redirect')
    if (redirect) router.replace(redirect)
    else router.back()
  },
})

const hasOauth = computed(() => {
  let result = false
  // #ifdef H5
  if (config.value?.oauthWechatMobileEnable) result = true
  if (config.value?.oauthQQEnable) result = true
  if (config.value?.oauthWeiboEnable) result = true
  // #endif
  // #ifdef MP-WEIXIN
  result = true
  // #endif
  // #ifdef APP-PLUS
  result = true
  // #endif
  return result
})

function doOauth(type: string) {
  if (!checkBeforeLogin()) return
  dialog.loadingOn()
  // #ifdef H5
  const wl = window.location
  const callback = `${wl.protocol}//${wl.host}${wl.pathname}`
  api
    .post('oauth/login', { type, callback })
    .then((res: any) => {
      dialog.loadingOff()
      EntryProcessorUtil.setRedirectEntry('/brick/module/member/oauth_bind', {
        type,
        successType: 'replace',
        successRedirect: router.getQuery('redirect'),
      })
      window.location.href = res.data.redirect
    })
    .catch(() => dialog.loadingOff())
  // #endif
  // #ifdef MP-WEIXIN
  ;(wx as any).login({
    success: (loginRes: any) => {
      EntryProcessorUtil.setRedirectEntry('/brick/module/member/oauth_bind', {
        type,
        successType: 'back',
        successBackDelta: 1,
        code: loginRes.code,
      })
      EntryProcessorUtil.detectAndProcess(true)
    },
    fail: (loginRes: any) => {
      console.error('doOauth.login.fail', loginRes)
      dialog.loadingOff()
      dialog.tipError('登录微信获取信息失败')
    },
  })
  // #endif
}

function doWechatMiniProgramLogin() {
  if (!checkBeforeLogin()) return
  doWechatMiniProgramLoginProcess((res) => {
    const redirect = router.getQuery('redirect')
    if (config.value?.Member_OauthBindPhoneEnable) {
      if (!res.data.phoneIsBind) {
        router.replace('/brick/module/member/profile_phone', { redirect })
        return
      }
    }
    if (redirect) {
      router.replace(redirect)
    } else {
      router.back()
    }
  })
}
</script>

<style lang="less" scoped>
.oauth {
  padding-top: 30px;
  text-align: center;
  color: var(--color-muted);

  .title {
  }

  .body {
    padding: 20px 0;
    display: flex;
    justify-content: center;
  }

  .item-wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin: 0 15px;

    &.btn-reset {
      padding: 0;
      margin: 0 15px;
      line-height: normal;
      background: transparent;
      border: none;
      &::after {
        border: none;
      }
    }

    .text {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      line-height: 1;
    }
  }

  .item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #999;
    color: #fff;
    border-radius: 50%;

    &.qq {
      background: #498ad5;
    }

    &.weibo {
      background: #e05244;
    }

    &.wechat {
      background: #00bb29;
    }

    &.apple {
      background: #000000;
    }
  }
}
</style>
