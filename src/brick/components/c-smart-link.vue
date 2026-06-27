<template>
  <view class="ub-smart-link" :class="type" @click.stop="go">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { reactive, useAttrs } from 'vue'

defineOptions({ name: 'CSmartLink' })

const props = defineProps({
  to: {
    type: String,
    default: null,
  },
  confirm: {
    type: String,
    default: null,
  },
  // primary
  type: {
    type: String,
    default: '',
  },
})

const state = reactive({})

const attrs = useAttrs()

function go() {
  let _go = () => {
    const clickHandler = attrs.onClick
    if (clickHandler) {
      typeof clickHandler === 'function' ? clickHandler() : clickHandler[0] && clickHandler[0]()
    }
    if (undefined === props.to || null === props.to) {
      return
    }
    if (props.to.indexOf('[url]') === 0) {
      window.location.href = props.to.substring(5)
    } else {
      router.to(props.to)
    }
  }
  if (props.confirm) {
    dialog.confirm(props.confirm, () => _go())
  } else {
    _go()
  }
}
</script>

<style lang="less" scoped>
.ub-smart-link {
  display: inline-block;

  &.link {
    color: var(--color-link);
  }

  &.primary {
    color: var(--color-primary);
  }
}
</style>
