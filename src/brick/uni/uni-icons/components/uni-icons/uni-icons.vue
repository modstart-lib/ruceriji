<template>
  <!-- #ifdef APP-NVUE -->
  <text :style="{ color: color, 'font-size': size + 'px' }" class="uni-icons" @click="_onClick">{{ unicode }}</text>
  <!-- #endif -->
  <!-- #ifndef APP-NVUE -->
  <text
    :style="{ color: color, 'font-size': size + 'px' }"
    class="uni-icons"
    :class="['uniui-' + type, customPrefix, customPrefix ? type : '']"
    @click="_onClick"
  ></text>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue'
import icons from './icons.js'

defineOptions({ name: 'UniIcons' })

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#333333',
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  customPrefix: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const state = reactive({
  icons: icons.glyphs,
})
const { icons } = toRefs(state)

const unicode = computed(() => {
  let code = state.icons.find((v) => v.font_class === props.type)
  if (code) {
    return unescape(`%u${code.unicode}`)
  }
  return ''
})

function _onClick() {
  emit('click')
}
</script>

<style lang="scss">
/* #ifndef APP-NVUE */
@import './uniicons.css';
@font-face {
  font-family: uniicons;
  src: url('./uniicons.ttf') format('truetype');
}

/* #endif */
.uni-icons {
  font-family: uniicons;
  text-decoration: none;
  text-align: center;
}
</style>
