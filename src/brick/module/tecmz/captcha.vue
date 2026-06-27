<template>
  <view id="body">
    <!-- #ifdef H5 | APP-PLUS -->
    <c-page-header title="人机验证"></c-page-header>
    <!-- #endif -->
    <view v-if="url">
      <web-view ref="webview" class="pb-captcha-iframe" :src="url" :fullscreen="false" @message="onMessage"></web-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { Starter } from '@/brick/BrickUni'

import { reactive, ref, onMounted, onUnmounted, getCurrentInstance, toRefs } from 'vue'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { useUi } from '@/brick/composables/useBaseStore'
import { router } from '@/brick/lib/router'

defineOptions({ name: 'Captcha' })

const instance = getCurrentInstance()

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  url: null,
  msg: null,
  processed: [],
})
const { url, processed } = toRefs(state)

const webviewRef = ref<any>(null)

function init() {
  state.url = 'https://api.tecmz.com/api_res/captcha/online/' + config.value.appId
  // #ifdef APP-PLUS
  //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效
  var currentWebview = (instance?.proxy as any).$scope.$getAppWebview()
  setTimeout(() => {
    const wv = currentWebview.children()[0]
    wv.setStyle({ top: parseInt(state.headerHeight) })
  }, 100)
  // #endif
}

function initListener() {
  if (!webviewRef.value) {
    setTimeout(() => {
      initListener()
    }, 100)
    return
  }
  // #ifdef H5
  window.addEventListener('message', onWindowMessage, false)
  // 禁止手机默认左右滑动行为
  // console.log('禁止手机默认左右滑动行为')
  // function touchHandlerDummy(e)
  // {
  //     console.log(e.type,e.target, e.cancelable)
  //     e.preventDefault();
  //     e.stopPropagation();
  // }
  // document.querySelector('#aa').addEventListener("touchstart", touchHandlerDummy, { passive: false,capture : true });
  // document.querySelector('#aa').addEventListener("touchmove", touchHandlerDummy, { passive: false ,capture : true});
  // document.querySelector('#aa').addEventListener("touchend", touchHandlerDummy, { passive: false,capture : true });
  // document.querySelector('#aa').addEventListener("touchcancel", touchHandlerDummy, { passive: false,capture : true });
  // history.pushState(null, null, document.URL);
  // window.addEventListener('popstate', function () {
  //     history.pushState(null, null, document.URL);
  // });
  // document.body.style.overflow = 'hidden'
  // document.body.style.touchAction = 'none'
  // document.body.addEventListener('MozTouchMove', function(e){e.preventDefault();});
  // document.body.addEventListener('touchstart', function (e) {
  //     console.log('touchstart', e)
  //     e.preventDefault()
  // }, false)
  // document.body.addEventListener('click', function (e) {
  //     console.log('touchstart', e)
  //     e.preventDefault()
  // }, false)
  // document.body.addEventListener('touchmove', function (e) {
  //     console.log('touchmove', e)
  //     e.preventDefault()
  //     return false
  // }, false)
  // document.body.addEventListener('touchcancel', function (e) {
  //     console.log('touchcancel', e)
  // }, false)
  // console.log('ok1');
  // #endif
}

function onProcessMessage(msg) {
  console.log('onProcessMessage', JSON.stringify(msg))
  if (state.processed.indexOf(msg.id) >= 0) {
    console.log('onProcessMessage.duplicated', msg.id)
    return
  }
  state.processed.push(msg.id)
  // {"type":"verify","result":"succcess","key":"jPalVDp3eoUtTNFzKKqTATB8Rk23IAbi"}
  switch (msg.type) {
    case 'verify':
      if (msg.result === 'success') {
        console.log('success', msg.key)
        let backIgnore = false
        // #ifdef MP-WEIXIN
        backIgnore = true
        // #endif
        callbackConfirm(msg, backIgnore)
      }
      break
  }
}

function onWindowMessage(e) {
  console.log('onWindowMessage', e)
  // H5
  try {
    let message = e.data.data.arg
    if (!message) {
      message = e.data.data
    }
    const msg = JSON.parse(message)
    if (msg.type) {
      onProcessMessage(msg)
    }
  } catch (e) {}
}

function onMessage(e) {
  console.log('onMessage', e)
  // APP-PLUS | MP-WEIXIN
  const msgs = e.detail.data
  for (let m of msgs) {
    try {
      const msg = JSON.parse(m)
      if (msg.type) {
        onProcessMessage(msg)
      }
    } catch (e) {}
  }
}

onMounted(() => {
  initListener()
})

onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('message', onWindowMessage, false)
  // #endif
})

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

<style lang="less">
// #ifdef H5
.pb-captcha-iframe {
  top: 50px !important;
  overflow: hidden !important;
  position: fixed !important;
  border: none;
  width: 100%;
  height: calc(100% - 50px);

  /deep/ iframe {
    width: 100% !important;
    height: 100% !important;
    border: none;
  }
}

// #endif
</style>
