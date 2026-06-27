<template>
  <view>
    <c-page-header title="修改头像" />

    <view class="pb-member-profile-avatar bg-white min-h-screen">
      <view class="p-2">
        <view
          class="rounded w-1_2 block overflow-hidden bg-cover bg-center bg-no-repeat aspect-square m-auto bg-gray-200"
          :style="{ 'background-image': 'url(' + user.avatarBig + ')' }"
        ></view>
      </view>
      <view class="p-10">
        <button
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer mb-5"
          :disabled="loading"
          :loading="loading"
          @click="doSelectImage('album')"
        >
          <icon-lucide-upload class="mr-2 shrink-0" color="#ffffff" />
          选择图片
        </button>
        <button
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer mb-5"
          :disabled="loading"
          :loading="loading"
          @click="doSelectImage('camera')"
        >
          <icon-lucide-image class="mr-2 shrink-0" color="#ffffff" />
          开始拍摄
        </button>
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer mb-5"
          :disabled="loading"
          :loading="loading"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
        >
          <icon-lucide-message-circle class="mr-2 shrink-0" color="#ffffff" />
          从选择微信头像
        </button>
        <!-- #endif -->
      </view>
      <ImageCropper ref="avatarRef" @save="doSave" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import ImageCropper from '../../components/c-image-cropper.vue'

defineOptions({ name: 'Avatar' })

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: false,
})
const { loading } = toRefs(state)

const avatarRef = ref<any>(null)

const user = computed(() => {
  return useUserStore().user
})

async function doSave(res) {
  state.loading = true
  try {
    await api.post('member_profile/avatar', { type: 'cropper', avatar: res.data })
    state.loading = false
    dialog.tipSuccess('修改成功')
    EventBus.$emitDelay('UpdateApp')
  } catch {
    state.loading = false
  }
}

function doSelectImage(sourceType) {
  const callback = () => {
    avatarRef.value.doSelectImage([sourceType])
  }
  // #ifdef H5
  callback()
  // #endif
  // #ifdef APP-PLUS
  if (SystemConfig.OSName === 'android') {
    if (SystemConfig.Brand === 'huawei') {
      const result = plus.navigator.checkPermission(
        sourceType === 'camera' ? 'CAMERA' : 'android.permission.READ_EXTERNAL_STORAGE'
      )
      if ('authorized' === result) {
        callback()
      } else {
        // huawei - use alert (no cancel button) per App Store Guideline 5.1.1(iv)
        dialog.alert('即将使用相册/相机上传头像', () => {
          callback()
        })
      }
    } else {
      callback()
    }
  } else if (SystemConfig.OSName === 'ios') {
    const result = plus.navigator.checkPermission(sourceType === 'camera' ? 'CAMERA' : 'GALLERY')
    if ('authorized' === result) {
      callback()
    } else {
      // use alert (no cancel button) per App Store Guideline 5.1.1(iv)
      dialog.alert('即将使用相册/相机上传头像', () => {
        callback()
      })
    }
  } else {
    callback()
  }
  // #endif
}

function onChooseAvatar(e) {
  dialog.loadingOn()
  api.postUpload(
    'member_profile/avatar',
    {
      filePath: e.detail.avatarUrl,
      name: 'avatar',
      formData: {
        type: 'file',
      },
    },
    (res) => {
      dialog.loadingOff()
      dialog.tipSuccess('修改成功')
      EventBus.$emitDelay('UpdateApp')
    },
    (res) => {
      dialog.loadingOff()
    }
  )
}

onShow(() => {
  Starter.boot()
})
</script>

<style lang="less">
.pb-member-profile-avatar {
  text-align: center;
  padding: 1rem;

  .avatar-preview {
    width: 300rpx;
    height: 300rpx;
  }
}
</style>
