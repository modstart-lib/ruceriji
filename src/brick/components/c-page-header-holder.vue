<template>
  <view>
    <view v-if="!headerStatusHide" :style="{ height: headerStatusHeight, backgroundColor: backgroundColor }"></view>
  </view>
</template>

<script setup lang="ts">
import { usePageHeader } from '@/brick/composables/usePageHeader'

defineOptions({ name: 'CPageHeaderHolder' })

const props = defineProps({
  title: { type: [String, null], default: '' },
  backgroundColor: { type: String, default: 'var(--color-content-bg)' },
  headerStatusHide: { type: Boolean, default: false },
})

const { headerStatusHeight } = usePageHeader({ ...props, cName: 'c-page-header-holder' })
</script>
