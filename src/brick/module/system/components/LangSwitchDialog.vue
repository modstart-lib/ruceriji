<template>
  <c-modal ref="modal" :title="$t('system.switchLanguage')" width="50%">
    <view>
      <view
        v-for="(l, lIndex) in langList"
        :key="l.value"
        class="flex w-full items-center justify-center py-1 px-4 text-sm rounded-full cursor-pointer mb-2"
        :class="{ 'bg-primary text-white': isActive(l.value) }"
        @click="doSwitchLanguage(l)"
      >
        {{ l.label }}
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { router } from '@/brick/lib/router'
import { Lang } from '@/brick/lib/lang'

defineOptions({ name: 'LangSwitchDialog' })

const state = reactive({
  langList: Lang.listLang(),
})
const { langList } = toRefs(state)

const modalRef = ref<any>(null)

function show() {
  modalRef.value.show()
}

function isActive(v) {
  return Lang.getLocale() === v
}

function doSwitchLanguage(l) {
  Lang.setLocale(l.value)
}
</script>
