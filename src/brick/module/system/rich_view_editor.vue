<template>
  <view>
    <c-page-header
      :title="pageTitle"
      title-align="center"
      :has-action="true"
      :custom-back-callback="true"
      @back="doCancel"
    >
      <template #action>
        <block>
          <text v-if="mode === 'view'" class="item text-primary" @click="mode = 'edit'"> 编辑 </text>
          <text v-if="mode === 'edit'" class="item text-primary" @click="doSave"> 保存 </text>
        </block>
      </template>
    </c-page-header>
    <view :class="{ 'rich-view-editor-hide': mode === 'edit' }">
      <view class="p-4">
        <view class="view-container">
          <rich-text v-if="!!value" class="text-sm leading-relaxed" :nodes="value" />
          <c-empty v-else />
        </view>
      </view>
    </view>
    <view :class="{ 'rich-view-editor-hide': mode === 'view' }">
      <view class="p-4">
        <view class="editor-container">
          <editor
            id="editor"
            class="ql-container"
            :placeholder="placeholder"
            show-img-size
            show-img-toolbar
            show-img-resize
            @input="onInput"
            @ready="onEditorReady"
          ></editor>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { Starter } from '@/brick/BrickUni'

import { reactive, computed, toRefs } from 'vue'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { useUi } from '@/brick/composables/useBaseStore'

defineOptions({ name: 'RichViewEditor' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  mode: 'view',
  titleView: '加载中...',
  titleEdit: '加载中...',
  placeholder: '输入内容...',
  editorCtx: null,
})
const { mode, titleView, titleEdit, placeholder, editorCtx } = toRefs(state)

const pageTitle = computed(() => {
  if (state.mode === 'view') {
    return state.titleView
  }
  return state.titleEdit
})

function init() {
  state.titleView = config.value.titleView || '查看内容'
  state.titleEdit = config.value.titleEdit || '编辑内容'
  if (!value.value) {
    state.mode = 'edit'
  }
  if (config.value.mode) {
    state.mode = config.value.mode
  }
  if (value.value) {
    if (state.editorCtx) {
      state.editorCtx.setContents({
        html: value.value,
      })
    }
  }
}

function onEditorReady() {
  // #ifdef MP-BAIDU
  state.editorCtx = requireDynamicLib('editorLib').createEditorContext('editorId')
  state.editorCtx.setContents({
    html: value.value,
  })
  // #endif
  // #ifdef APP-PLUS || H5 ||MP-WEIXIN
  uni
    .createSelectorQuery()
    .select('#editor')
    .context((res) => {
      state.editorCtx = res.context
      state.editorCtx.setContents({
        html: value.value,
      })
    })
    .exec()
  // #endif
}

function onInput(e) {
  value.value = e.detail.html
}

function doSave() {
  callbackConfirm(value.value)
}

function doCancel() {
  callbackCancel()
}

onReady(() => {
  Starter.boot(() => {
    const _waitInit = () => {
      if (!isInit.value) {
        setTimeout(_waitInit, 10)
        return
      }
      init()
    }
    _waitInit()
  })
})
</script>

<style lang="less" scoped>
.rich-view-editor-hide {
  height: 0px;
  overflow: hidden;
}

.view-container,
.editor-container {
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem;
  height: calc(100vh - 150px);
}

#editor {
  width: 100%;
  height: 300px;
}

button {
  margin-top: 10px;
}
</style>
