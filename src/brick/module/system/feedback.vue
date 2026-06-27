<template>
  <view class="feedback-page min-h-screen bg-content-bg">
    <c-page-header title="意见反馈" />

    <view class="feedback-page__intro px-4 pt-3 pb-1">
      <text class="feedback-page__intro-text">描述问题或建议，我们会认真阅读并尽快处理</text>
    </view>

    <view class="feedback-page__body px-4 pb-8">
      <view class="feedback-page__card">
        <u-form
          ref="formRef"
          class="feedback-page__form"
          :model="formData"
          :rules="rules"
          label-position="top"
          label-width="100%"
          :border-bottom="false"
          :label-style="labelStyle"
        >
          <u-form-item label="主题" prop="title" required :border-bottom="false">
            <view class="feedback-page__field">
              <u-input
                v-model="formData.title"
                placeholder="简要概括，例如「支付失败」"
                border="none"
                clearable
                font-size="15"
              />
            </view>
          </u-form-item>

          <u-form-item label="详细内容" prop="content" required :border-bottom="false">
            <view class="feedback-page__field feedback-page__field--textarea">
              <u-textarea
                v-model="formData.content"
                placeholder="请尽量说明出现步骤、页面或截图说明（如有）"
                border="none"
                :height="140"
                count
                :maxlength="500"
              />
            </view>
          </u-form-item>

          <u-form-item label="联系方式" prop="contact" :border-bottom="false">
            <view class="feedback-page__field">
              <u-input
                v-model="formData.contact"
                placeholder="选填：手机号 / 邮箱，便于回访"
                border="none"
                clearable
                font-size="15"
              />
            </view>
          </u-form-item>
        </u-form>
      </view>

      <view class="mt-6">
        <u-button
          :loading="submitting"
          type="primary"
          shape="circle"
          size="large"
          :block="true"
          :custom-style="submitBtnStyle"
          @click="doSubmit"
        >
          <icon-lucide-message-circle />
          <text class="ml-2">提交反馈</text>
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

const formRef = ref<{ validate: (options?: { showErrorMsg?: boolean }) => Promise<unknown> } | null>(null)
const submitting = ref(false)

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
}

const submitBtnStyle = {
  height: '48px',
  fontWeight: '600',
}

const formData = reactive({
  title: '',
  content: '',
  contact: '',
})

const rules = {
  title: [{ required: true, message: '请输入主题', trigger: ['blur', 'change'] }],
  content: [{ required: true, message: '请输入反馈内容', trigger: ['blur', 'change'] }],
}

function doSubmit() {
  formRef.value
    ?.validate()
    .then(async () => {
      submitting.value = true
      try {
        await api.post('feedback/submit', formData)
        submitting.value = false
        dialog.tipSuccess('提交成功', () => {
          router.back()
        })
      } catch {
        submitting.value = false
      }
    })
    .catch(() => {})
}

onReady(() => {
  Starter.boot(() => {})
})
</script>

<style scoped lang="scss">
.feedback-page__body {
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

.feedback-page__intro-text {
  font-size: 13px;
  line-height: 1.55;
  color: #6b7280;
}

.feedback-page__card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px 18px 16px;
  box-shadow: 0 2px 20px rgba(17, 24, 39, 0.06);
}

.feedback-page__field {
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f4f6;
  border-radius: 14px;
  padding: 10px 14px;
  overflow: hidden;
}

/* 详细内容：去掉 u-textarea 默认白底+内边距，避免「灰底里套一块小白框」 */
.feedback-page__field--textarea {
  padding: 12px 14px 10px;
}

.feedback-page__field--textarea :deep(.u-textarea) {
  width: 100%;
  background-color: transparent !important;
  padding: 0 !important;
  border-radius: 0;
  box-sizing: border-box;
}

.feedback-page__field--textarea :deep(.u-textarea__field) {
  width: 100%;
  box-sizing: border-box;
  font-size: 15px;
  background-color: transparent;
  padding-bottom: 22px;
}

.feedback-page__field--textarea :deep(.u-textarea__count) {
  background-color: transparent !important;
  right: 0;
  bottom: 0;
}

/* 收紧 uView 表单项默认上下留白，由卡片内边距承担节奏 */
.feedback-page__form :deep(.u-form-item) {
  margin-bottom: 20px;
}

.feedback-page__form :deep(.u-form-item:last-child) {
  margin-bottom: 0;
}

.feedback-page__form :deep(.u-form-item__body) {
  padding-top: 0;
  padding-bottom: 0;
}

.feedback-page__form :deep(.u-form-item__body__left__content__label) {
  margin-bottom: 8px;
}

/* top 布局时默认 labelWidth=45 会压窄标签列；已改 labelWidth=100%，并强制右侧表单项插槽横向撑满 */
.feedback-page__form :deep(.u-form-item__body__right) {
  width: 100%;
  box-sizing: border-box;
}

.feedback-page__form :deep(.u-form-item__body__right__content) {
  width: 100%;
}

.feedback-page__form :deep(.u-form-item__body__right__content__slot) {
  width: 100%;
  align-items: stretch;
}
</style>
