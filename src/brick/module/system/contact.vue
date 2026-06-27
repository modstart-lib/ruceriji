<template>
  <view class="pb-system-contact min-h-screen bg-content-bg">
    <c-page-header title="联系客服" />
    <c-loading v-if="loading" page />
    <view v-else class="pb-system-contact__body px-4 pt-2">
      <view class="pb-system-contact__intro mb-4">
        <text class="pb-system-contact__intro-text">如需帮助或商务合作，可通过以下方式与我们取得联系</text>
      </view>

      <view class="pb-system-contact__hero mb-4">
        <view class="pb-system-contact__hero-inner">
          <view class="pb-system-contact__logo-wrap">
            <image class="pb-system-contact__logo" mode="widthFix" :src="config.siteLogo" />
          </view>
          <text v-if="config.siteSlogan" class="pb-system-contact__slogan">{{ config.siteSlogan }}</text>
        </view>
      </view>

      <view v-if="data.qrcode" class="pb-system-contact__card pb-system-contact__card--qr mb-4">
        <view class="pb-system-contact__card-head">
          <view class="pb-system-contact__card-title-row">
            <view class="pb-system-contact__icon-badge">
              <icon-lucide-message-circle class="pb-system-contact__icon-muted" :size="18" />
            </view>
            <text class="pb-system-contact__card-title">与我们直接沟通</text>
          </view>
          <text class="pb-system-contact__card-sub">咨询、建议、吐槽、鼓励、合作</text>
        </view>
        <view class="pb-system-contact__qr-frame">
          <image class="pb-system-contact__qr" mode="widthFix" :src="data.qrcode" @tap="previewQrCode" />
        </view>
        <text class="pb-system-contact__qr-hint">长按或扫码添加</text>
      </view>

      <view v-if="hasContactRows" class="pb-system-contact__card pb-system-contact__card--list mb-4">
        <view v-if="data.email" class="pb-system-contact__row" @tap="copyText(data.email)">
          <view class="pb-system-contact__row-icon">
            <icon-lucide-mail class="pb-system-contact__icon-muted" :size="18" />
          </view>
          <view class="pb-system-contact__row-main">
            <text class="pb-system-contact__row-label">邮箱</text>
            <text class="pb-system-contact__row-value">{{ data.email }}</text>
          </view>
          <view class="pb-system-contact__row-action">
            <icon-lucide-copy class="pb-system-contact__icon-muted" :size="16" />
            <text class="pb-system-contact__row-action-text">复制</text>
          </view>
        </view>
        <view v-if="data.phone" class="pb-system-contact__row pb-system-contact__row--phone">
          <view class="pb-system-contact__row-icon">
            <icon-lucide-phone class="pb-system-contact__icon-muted" :size="18" />
          </view>
          <view class="pb-system-contact__row-main" @tap.stop="makePhoneCall">
            <text class="pb-system-contact__row-label">电话</text>
            <text class="pb-system-contact__row-value">{{ data.phone }}</text>
          </view>
          <view class="pb-system-contact__row-side">
            <view class="pb-system-contact__chip" @tap.stop="makePhoneCall">
              <icon-lucide-phone-call class="pb-system-contact__icon-muted" :size="14" />
              <text class="pb-system-contact__chip-text">拨打</text>
            </view>
            <view class="pb-system-contact__chip" @tap.stop="copyText(data.phone)">
              <icon-lucide-copy class="pb-system-contact__icon-muted" :size="14" />
              <text class="pb-system-contact__chip-text">复制</text>
            </view>
          </view>
        </view>
        <view v-if="data.address" class="pb-system-contact__row" @tap="copyText(data.address)">
          <view class="pb-system-contact__row-icon pb-system-contact__row-icon--top">
            <icon-lucide-map-pin class="pb-system-contact__icon-muted" :size="18" />
          </view>
          <view class="pb-system-contact__row-main">
            <text class="pb-system-contact__row-label">地址</text>
            <text class="pb-system-contact__row-value pb-system-contact__row-value--multiline">{{ data.address }}</text>
          </view>
          <view class="pb-system-contact__row-action pb-system-contact__row-action--top">
            <icon-lucide-copy class="pb-system-contact__icon-muted" :size="16" />
            <text class="pb-system-contact__row-action-text">复制</text>
          </view>
        </view>
      </view>

      <view v-if="noContent" class="pb-system-contact__empty-wrap">
        <c-empty text="暂未配置客服信息" />
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view class="h-24" />
      <view class="pb-system-contact__bar">
        <button class="pb-system-contact__bar-btn" open-type="contact" @contact="onContact">
          <icon-lucide-headphones class="pb-system-contact__icon-on-primary" :size="18" />
          <text class="pb-system-contact__bar-btn-text">在线客服咨询</text>
        </button>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useConfig } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, toRefs } from 'vue'

defineOptions({ name: 'Contact' })

const { config } = useConfig()

const state = reactive({
  loading: true,
  data: {
    email: '',
    phone: '',
    address: '',
    qrcode: '',
  },
})
const { loading, data } = toRefs(state)

const hasContactRows = computed(() => {
  return !!(state.data.email || state.data.phone || state.data.address)
})

const noContent = computed(() => {
  return !state.data.email && !state.data.phone && !state.data.address && !state.data.qrcode
})

function onContact(e: unknown) {
  console.log('onContact', e)
}

function copyText(text: string) {
  if (!text) return
  uni.setClipboardData({
    data: text,
    success: () => {
      dialog.tipSuccess('已复制')
    },
  })
}

function previewQrCode() {
  if (!state.data.qrcode) return
  uni.previewImage({ urls: [state.data.qrcode] })
}

function makePhoneCall() {
  const raw = state.data.phone?.replace(/[\s-]/g, '') ?? ''
  if (!raw) return
  uni.makePhoneCall({
    phoneNumber: raw,
    fail: () => {
      copyText(state.data.phone)
    },
  })
}

async function init() {
  state.loading = true
  dialog.loadingOn()
  const res = await api.post('site/contact', {})
  state.loading = false
  dialog.loadingOff()
  state.data = res.data
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>

<style scoped lang="scss">
.pb-system-contact__body {
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

.pb-system-contact__intro-text {
  font-size: 13px;
  line-height: 1.55;
  color: #6b7280;
}

.pb-system-contact__hero {
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(145deg, #f3f4f6 0%, #fafafa 48%, #ffffff 100%);
  box-shadow: 0 2px 20px rgba(17, 24, 39, 0.06);
}

.pb-system-contact__hero-inner {
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pb-system-contact__logo-wrap {
  width: 112px;
  margin-bottom: 12px;
}

.pb-system-contact__logo {
  width: 100%;
  display: block;
}

.pb-system-contact__slogan {
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
  text-align: center;
}

.pb-system-contact__card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 18px 16px 16px;
  box-shadow: 0 2px 20px rgba(17, 24, 39, 0.06);
}

.pb-system-contact__card--qr {
  text-align: center;
}

.pb-system-contact__card-head {
  margin-bottom: 16px;
}

.pb-system-contact__card-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.pb-system-contact__icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #ececec;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pb-system-contact__card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.pb-system-contact__card-sub {
  display: block;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.45;
}

.pb-system-contact__qr-frame {
  display: inline-block;
  padding: 12px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
}

.pb-system-contact__qr {
  width: 160px;
  height: 160px;
  display: block;
}

.pb-system-contact__qr-hint {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.pb-system-contact__card--list {
  padding: 4px 0 0;
}

.pb-system-contact__row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.pb-system-contact__row:last-child {
  border-bottom: none;
}

.pb-system-contact__row--phone {
  align-items: flex-start;
}

.pb-system-contact__row-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 装饰/次要图标：用主色阶中灰，避免与正文纯黑（#111）糊成一片 */
.pb-system-contact__icon-muted {
  color: var(--token-primary-500);
}

/* 底部「在线客服」主按钮上的图标：显式白色 */
.pb-system-contact__icon-on-primary {
  color: #ffffff;
}

.pb-system-contact__row-icon--top {
  margin-top: 2px;
}

.pb-system-contact__row-main {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
}

.pb-system-contact__row-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.pb-system-contact__row-value {
  font-size: 15px;
  color: #111827;
  line-height: 1.45;
  word-break: break-all;
}

.pb-system-contact__row-value--multiline {
  white-space: pre-wrap;
}

.pb-system-contact__row-action {
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--token-primary-500);
}

.pb-system-contact__row-action--top {
  align-self: flex-start;
  margin-top: 22px;
}

.pb-system-contact__row-action-text {
  font-size: 11px;
}

.pb-system-contact__row-side {
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 电话行「拨打 / 复制」：统一灰底次要按钮，与列表其它图标同为 token 灰 */
.pb-system-contact__chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.pb-system-contact__chip-text {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.pb-system-contact__empty-wrap {
  padding: 24px 0;
}

.pb-system-contact__bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(249, 250, 251, 0.98) 70%, transparent);
}

.pb-system-contact__bar-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
  line-height: 1.4;
}

.pb-system-contact__bar-btn::after {
  border: none;
}

.pb-system-contact__bar-btn-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
</style>
