<template>
  <view>
    <c-modal ref="modalRef" title="成就详情" width="92vw">
      <view v-if="award" class="px-4 py-8">
        <view class="p-2 w-44 mx-auto">
          <c-cover :src="award.cover" background-color="transparent" />
        </view>
        <view class="font-bold text-xl text-center mt-4">{{ award.title }}</view>
        <view class="text-center text-muted mt-2">{{ award.summary }}</view>
        <view v-if="award._getTime" class="text-center text-tertiary mt-2 text-sm">
          获得时间：{{ award._getTime }}
        </view>
        <view class="mt-6">
          <u-button v-if="!award._getTime" type="primary" shape="circle" :block="true" :disabled="true">
            <text class="ml-2">未获得</text>
          </u-button>
          <u-button v-else type="primary" shape="circle" :block="true" @click="doShare">
            <icon-lucide-share-2 :size="20" color="#fff" />
            <text class="ml-2">立即分享</text>
          </u-button>
        </view>
      </view>
    </c-modal>
    <c-image-preview ref="imagePreviewRef" image-ratio="2-3" :border="true" download="image.png" />
    <bui-image-design ref="imageDesignRef" />
  </view>
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { reactive, ref, toRefs } from 'vue'

defineOptions({ name: 'AppAwardDetailDialog' })

const state = reactive({
  award: null,
})
const { award } = toRefs(state)

const modalRef = ref<any>(null)
const imagePreviewRef = ref<any>(null)
const imageDesignRef = ref<any>(null)

function show(award) {
  state.award = award
  modalRef.value.show()
}

function close() {
  modalRef.value.close()
}

async function doShare() {
  modalRef.value.close()
  dialog.loadingOn('正在生成海报')
  const res = await api.post('app_award/share_config', { id: state.award.id })
  const url = await imageDesignRef.value.render(res.data.imageConfig)
  dialog.loadingOff()
  imagePreviewRef.value.show(url, '下载分享海报')
}

defineExpose({
  show,
  close,
})
</script>
