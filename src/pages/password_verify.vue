<template>
  <view class="min-h-screen relative pb-6 bg-[#f7f8fa]">
    <c-page-header title="解锁屏幕" background-color="transparent" color="#111111" />
    <view class="p-3">
      <view class="text-center mb-6 text-xl font-bold" style="color: #111111">输入密码解锁屏幕</view>
      <view class="password-display flex justify-center mb-10 mt-4">
        <view
          v-for="(_, i) in 6"
          :key="i"
          class="w-8 h-8 rounded-full border border-gray-200 mx-2 flex items-center justify-center bg-white shadow-sm"
        >
          <view
            v-if="i < password.length"
            class="w-3.5 h-3.5 rounded-full"
            style="background-color: var(--color-rc-primary); box-shadow: 0 2px 8px rgba(250, 224, 88, 0.5)"
          />
        </view>
      </view>
      <!-- 数字键盘 -->
      <view class="grid grid-cols-3 gap-4 px-4">
        <view
          v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']"
          :key="n"
          class="text-center py-5 text-2xl font-bold rounded-3xl transition-transform active:scale-95"
          :class="
            n !== ''
              ? 'bg-white text-[#111111] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] cursor-pointer'
              : ''
          "
          @click="onKeyPress(n)"
        >
          <template v-if="n === 'del'">
            <view class="flex items-center justify-center h-full"
              ><icon-lucide-delete :size="28" color="#111111"
            /></view>
          </template>
          <template v-else>{{ n }}</template>
        </view>
      </view>
      <view class="pt-10 text-center">
        <view class="flex justify-center items-center font-medium" style="color: #111111; opacity: 0.6">
          <icon-lucide-circle-question-mark :size="16" class="mr-1.5" />
          忘记锁屏密码？
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { dialog } from '@/brick/lib/dialog'
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'PasswordVerifyPage' })

const state = reactive({
  password: '',
})
const { password } = toRefs(state)

function onKeyPress(key) {
  if (key === '') return
  if (key === 'del') {
    state.password = state.password.slice(0, -1)
    return
  }
  if (state.password.length >= 6) return
  state.password += key.toString()
  if (state.password.length === 6) {
    onPasswordComplete()
  }
}

function onPasswordComplete() {
  dialog.tipSuccess(`密码正确`)
  setTimeout(() => {
    state.password = ''
  }, 1500)
}
</script>
