<template>
  <view>
    {{ total }}
  </view>
</template>

<script setup lang="ts">
import { useEventBus } from '@/brick/composables/useEventBus'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { onMounted, reactive, toRefs } from 'vue'

defineOptions({ name: 'MemberCreditTotal' })

const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { addDataUpdateListener, emitDataUpdate, emitDataUpdateDelay } = useEventBus()

const state = reactive({
  total: 0,
})
const { total } = toRefs(state)

async function doLoad() {
  if (user.value.id > 0) {
    const res = await api.postCached('member_credit/get', {})
    state.total = res.data.total
  } else {
    state.total = 0
  }
}

onMounted(() => {
  doLoad()
  addDataUpdateListener('UserChange', (param) => {
    doLoad()
  })
})
</script>
