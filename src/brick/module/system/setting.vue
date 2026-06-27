<template>
  <view>
    <c-page-header :title="$t('system.setting')" />

    <view class="p-2">
      <view class="rounded-xl overflow-hidden mb-2 bg-white">
        <view
          v-if="config.Member_AgreementEnable"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/doc', { type: 'agreement' })"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-check :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ config.Member_AgreementTitle }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          v-if="config.Member_PrivacyEnable"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/doc', { type: 'privacy' })"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-lock-open :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ config.Member_PrivacyTitle }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <!--                <view class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors" v-if="$hasModule('CmsQa')"-->
        <!--                      @tap="router.to('/brick/module/system/qa')">-->
        <!--                    <view class="flex-1 ml-2 text-sm text-gray-700">-->
        <!--                        {{ $t('system.helpCenter') }}-->
        <!--                    </view>-->
        <!--                    <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>-->
        <!--                </view>-->
        <!--                <view class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"-->
        <!--                      @tap="router.to('/brick/module/system/contact')">-->
        <!--                    <view class="flex-1 ml-2 text-sm text-gray-700">-->
        <!--                        {{ $t('system.contactUs') }}-->
        <!--                    </view>-->
        <!--                    <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>-->
        <!--                </view>-->
        <!--                <view class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors" v-if="$hasModule('Feedback')"-->
        <!--                      @tap="router.to('/brick/module/system/feedback')">-->
        <!--                    <view class="flex-1 ml-2 text-sm text-gray-700">-->
        <!--                        {{ $t('system.feedback') }}-->
        <!--                    </view>-->
        <!--                    <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>-->
        <!--                </view>-->
        <!-- #ifdef MP-WEIXIN -->
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="doSetting"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-settings :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ $t('system.permissionSetting') }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <!-- #endif -->
        <view
          v-if="i18nEnable"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @click="langSwitchDialogRef?.show()"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-activity :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ $t('system.switchLanguage') }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @click="doClearCache"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-trash-2 :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ $t('system.clearCache') }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          v-if="config.Member_DeleteEnable && hasModule('Member')"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="requireUserLogin(() => router.to('/brick/module/member/profile_delete'))"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-triangle-alert :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 注销账号 </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <!-- #ifdef MP-WEIXIN | APP-PLUS -->
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-info :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 版本号 </view>
          <view class="flex flex-col items-end">
            <view class="text text-tertiary"> v{{ version }} </view>
            <view class="text-[10px] text-gray-400">v{{ buildVersion }}</view>
          </view>
        </view>
        <!-- #endif -->
      </view>

      <view v-if="darkModeEnable" class="rounded-xl overflow-hidden mb-2 bg-white">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-palette :size="18" /></view>
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ $t('system.darkMode') }}
          </view>
          <view>
            <c-switch :value="ui.darkMode" @input="doDarkMode"></c-switch>
          </view>
        </view>
      </view>
    </view>

    <LangSwitchDialog ref="langSwitchDialogRef" />
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useBrickBaseStore, useConfig, useUi } from '@/brick/composables/useBaseStore'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { Storage } from '@/brick/lib/storage'
import { SystemSetting } from '@/config/setting'
import { onReady } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VersionManager } from '../../lib/version'
import LangSwitchDialog from './components/LangSwitchDialog'

declare const __BUILD_VERSION__: string

const langSwitchDialogRef = ref(null)
const { t } = useI18n()
const brickStore = useBrickBaseStore()
const { config, SystemConfig, hasModule } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()
const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()

const version = computed(() => {
  return VersionManager.version()
})

const buildVersion = __BUILD_VERSION__

const darkModeEnable = computed(() => {
  return !!SystemSetting.uiDarkModeSwitchEnable
})

const i18nEnable = computed(() => {
  return !!SystemSetting.i18nEnable
})

function doClearCache() {
  const apiToken = Storage.get('api-token')
  Storage.clear()
  Storage.set('api-token', apiToken)
  dialog.tipSuccess(t('system.clearSuccess'))
}

function doDarkMode(v) {
  brickStore.SET_DARK_MODE(v)
}

function doSetting() {
  // #ifdef MP-WEIXIN
  wx.openSetting()
  // #endif
}

function doLogout() {
  dialog.confirm('确认退出登录？', async () => {
    const redirect = router.getQuery('redirect')
    if (config.value.ssoClientEnable) {
      // window.__Dao.exec('sso/server_logout_prepare', {
      //     domainUrl: UrlUtil.domainUrl(),
      // }, res => {
      //     window.location.href = res.data.redirect
      // })
    } else {
      await api.post('logout', {})
      EventBus.$emitDelay('UpdateApp', () => {
        if (redirect) {
          router.replace(redirect)
        } else {
          router.back()
        }
      })
    }
  })
}

onReady(() => {
  Starter.boot(() => {})
})
</script>
