<template>
  <view class="rich-html-wrap">
    <!-- #ifdef H5 -->
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
    <view ref="html" class="rich-html-content" v-html="valueHtml"></view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <rich-text ref="html" class="rich-html-content" space="ensp" :nodes="valueHtml"></rich-text>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { HtmlUtil } from '../lib/html'

defineOptions({ name: 'CRichHtml' })

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  renderProcessor: {
    type: Function,
    default: null,
  },
})

const { t } = useI18n()

const htmlRef = ref<any>(null)

const valueHtml = computed(() => {
  let value = props.value
  if (props.renderProcessor) {
    value = props.renderProcessor(value)
  }
  return HtmlUtil.adapt(value)
})

onMounted(() => {
  // #ifdef H5
  htmlRef.value.$el.addEventListener('click', (e) => {
    let target = e.target
    let text = target.getAttribute('data-clipboard-text')
    if (target.tagName === 'A' && text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          dialog.tipSuccess(t('common.copySuccess'))
        },
      })
    }
  })
  // #endif
})
</script>

<style lang="scss">
.rich-html-wrap {
  /* #ifdef H5 */
  .rich-html-content {
    font-size: 14px;
    line-height: 1.8;
    color: #333;
    word-break: break-word;
    overflow-wrap: break-word;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      font-weight: bold;
      color: #1a1a1a;
      line-height: 1.4;
      margin: 1em 0 0.5em;
    }
    :deep(h1) { font-size: 1.8em; }
    :deep(h2) { font-size: 1.5em; }
    :deep(h3) { font-size: 1.25em; }
    :deep(h4) { font-size: 1.1em; }
    :deep(h5), :deep(h6) { font-size: 1em; }

    :deep(p) {
      margin: 0.75em 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      margin: 0.6em auto;
    }

    :deep(a) {
      color: #007aff;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    :deep(ul) {
      list-style: disc;
      padding-left: 1.5em;
      margin: 0.75em 0;
    }
    :deep(ol) {
      list-style: decimal;
      padding-left: 1.5em;
      margin: 0.75em 0;
    }
    :deep(li) {
      margin: 0.3em 0;
      line-height: 1.7;
    }

    :deep(blockquote) {
      border-left: 4px solid #ddd;
      background: #f9f9f9;
      margin: 1em 0;
      padding: 0.6em 1em;
      color: #555;
      border-radius: 0 4px 4px 0;
    }

    :deep(code) {
      background: #f4f4f4;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      padding: 0.15em 0.4em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
      font-size: 0.875em;
      color: #e83e8c;
    }

    :deep(pre) {
      background: #1e1e2e;
      border-radius: 8px;
      padding: 1em 1.2em;
      overflow-x: auto;
      margin: 1em 0;

      code {
        background: none;
        border: none;
        padding: 0;
        color: #cdd6f4;
        font-size: 0.875em;
        line-height: 1.6;
      }
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.9em;
      display: block;
      overflow-x: auto;

      th,
      td {
        border: 1px solid #e0e0e0;
        padding: 0.5em 0.75em;
        text-align: left;
        word-break: break-all;
      }
      th {
        background: #f5f7fa;
        font-weight: bold;
        color: #333;
      }
      tr:nth-child(even) td {
        background: #fafbfc;
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid #e8e8e8;
      margin: 1.5em 0;
    }

    :deep(strong), :deep(b) { font-weight: bold; }
    :deep(em), :deep(i) { font-style: italic; }
    :deep(del), :deep(s) { text-decoration: line-through; color: #999; }
    :deep(mark) { background: #fff3cd; padding: 0.1em 0.2em; border-radius: 2px; }
  }
  /* #endif */

  /* #ifndef H5 */
  .rich-html-content {
    font-size: 28rpx;
    line-height: 1.8;
    color: #333;

    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      color: #1a1a1a;
      line-height: 1.4;
      margin: 1em 0 0.5em;
    }
    h1 { font-size: 1.8em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    p { margin: 0.75em 0; }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }

    a { color: #007aff; }

    blockquote {
      border-left: 4px solid #ddd;
      background: #f9f9f9;
      padding: 0.6em 1em;
      color: #555;
    }

    code {
      background: #f4f4f4;
      border-radius: 4px;
      padding: 0.15em 0.4em;
      font-size: 0.875em;
      color: #e83e8c;
    }

    pre {
      background: #1e1e2e;
      border-radius: 8px;
      padding: 1em;
      overflow-x: auto;
      margin: 1em 0;

      code {
        background: none;
        padding: 0;
        color: #cdd6f4;
      }
    }
  }
  /* #endif */
}
</style>
