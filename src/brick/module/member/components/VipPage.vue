<template>
  <view class="pb-member-vip">
    <c-page-header-trans ref="header" title="VIP会员" color="#FECA95" :has-back="mode !== 'tabbar'">
    </c-page-header-trans>
    <view>
      <view class="top-bg pt-20 px-8 pb-8" :style="{ marginTop: headMarginTop }">
        <view v-if="loading" class="h-13"></view>
        <view v-else class="flex text-white items-center">
          <view class="w-12">
            <view>
              <image
                class="block overflow-hidden bg-cover bg-center bg-no-repeat w-10 h-10 rounded-full"
                :src="user.avatar"
              />
            </view>
          </view>
          <view class="flex-grow">
            <view class="text-[#e9bd6c]">
              {{ user.viewName }}
            </view>
            <view class="text-sm">
              <text
                class="inline-block rounded-full px-3 py-0.5 text-xs text-center whitespace-nowrap align-middle cursor-default text-warning bg-[#fff2f0] font-bold mr-1"
              >
                {{ user.vip ? user.vip.title : '游客' }}
              </text>
              <text v-if="user.vipExpire" class="mr-1">{{ user.vipExpire }}过期</text>
            </view>
          </view>
        </view>
      </view>
      <c-loading v-if="loading" page />
      <div v-else class="vip-list-container">
        <scroll-view class="vip-list" scroll-x="true" :scroll-into-view="scrollIntoView" scroll-with-animation>
          <view
            v-for="(vip, vipIndex) in vips"
            :id="'item' + vipIndex"
            :key="vipIndex"
            class="item"
            :class="{ active: vipActiveId === vip.id }"
            @click="doVipActive(vip.id)"
          >
            <view class="flex-1 ml-2 text-sm text-gray-700">
              {{ vip.title }}
            </view>
            <view class="price">
              ￥{{ vip.price }}
              <text class="text-xs">元</text>
            </view>
            <view class="line-through text-gray-400"> ￥{{ vip.priceMarket }} </view>
            <view class="desc">
              {{ vip.desc }}
            </view>
            <view
              v-if="vip.priceMarket - vip.price > 0"
              class="item-active-show absolute -left-1 -top-3 p-1 text-sm bg-red-500 rounded-lg text-white"
            >
              优惠立减{{ (vip.priceMarket - vip.price).toFixed(2) }}元
            </view>
          </view>
        </scroll-view>
        <view class="nav-item left" @click="doPrev()">
          <icon-lucide-chevron-left />
        </view>
        <view class="nav-item right" @click="doNext()">
          <icon-lucide-chevron-right class="text-base" />
        </view>
      </div>
      <view v-if="hasModule('Voucher')" class="mx-3 bg-content-bg mb-5 rounded-lg px-3">
        <MemberVoucherSelector ref="memberVoucherSelector" @change="doUpdateVoucher" />
      </view>
      <view class="mb-5 px-3">
        <c-rolling-text :values="openUsersList" />
      </view>
      <view v-if="rightsSelected.length > 0" class="bg-content-bg mx-3 mb-5 rounded-lg px-3 pt-3">
        <view class="row">
          <view v-for="(r, rIndex) in rightsSelected" :key="r.title" class="col-6">
            <view class="flex items-center mb-3">
              <image class="w-6 h-6 mr-2" mode="cover" :src="r.image" />
              <view class="flex-grow">
                <view class="text-sm">{{ r.title }}</view>
                <view class="text-sm text-muted">{{ r.desc }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="vipSelected" class="mx-3 bg-white rounded-xl mb-2">
        <view class="head">
          <view class="flex-1 ml-2 text-sm text-gray-700">
            {{ vipSelected.title }}
          </view>
        </view>
        <view class="body">
          <rich-text class="text-sm leading-relaxed" :nodes="vipSelected.content || ''" />
        </view>
      </view>
      <view v-if="content" class="mx-3 bg-white rounded-xl mb-2">
        <view class="head">
          <view class="flex-1 ml-2 text-sm text-gray-700"> VIP开通说明 </view>
        </view>
        <view class="body">
          <rich-text class="text-sm leading-relaxed" :nodes="content || ''" />
        </view>
      </view>
      <view class="h-32"></view>
      <view
        class="bg-white fixed left-0 right-0 shadow-lg"
        :class="{ 'bottom-12': mode === 'tabbar', 'bottom-0': mode !== 'tabbar' }"
      >
        <view v-if="countDown > 0" class="text-center px-3 py-1 bg-yellow-100">
          <icon-lucide-clock class="mr-1" />
          优惠剩余
          <text class="text-warning mx-1 w-28 inline-block font-mono">{{ countDownTime }}</text>
        </view>
        <view v-if="user.id > 0" class="flex items-center p-3">
          <view class="flex-grow">
            <view class="text-sm leading-6">
              <text class="text-warning mr-1 text-lg">{{ vipCalc.type }}</text>
              <text class="mr-1">支付</text>
              <text class="text-warning mr-1 text-lg">{{ vipCalc.price }}</text>
              <text class="mr-1">元</text>
            </view>
            <view v-if="0" class="text-sm leading-6">
              购买后
              <text class="text-warning mx-1">{{ vipCalc.expire }}</text>
              过期
            </view>
          </view>
          <view class="">
            <view
              class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer btn-vip"
              @tap="doSubmit"
              >确认支付</view
            >
          </view>
        </view>
        <view v-else class="p-3">
          <view
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer btn-vip"
            @tap="doLogin"
          >
            登录开通
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import MemberVoucherSelector from '@/brick/module/member_voucher/MembetVoucherSelector.vue'
import { computed, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue'

defineOptions({ name: 'VipPage' })

const props = defineProps({
  mode: {
    type: String,
    default: '',
  },
})

const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { config, SystemConfig, hasModule } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  loading: true,
  content: '',
  countDownTimer: null,
  countDown: -1,
  countDownEnd: 0,
  countDownTime: '00:00:00.0',
  openUsers: [],
  vips: [],
  rights: [],
  vipActiveId: 0,
  scrollIntoView: '',
  vipCalc: {
    type: '-',
    price: '-',
    expire: '-',
  },
  voucherId: 0,
})
const {
  loading,
  content,
  countDownTimer,
  countDown,
  countDownEnd,
  countDownTime,
  openUsers,
  vips,
  rights,
  vipActiveId,
  scrollIntoView,
  vipCalc,
  voucherId,
} = toRefs(state)

const memberVoucherSelectorRef = ref<any>(null)

const openUsersList = computed(() => {
  return state.openUsers.map((o) => {
    return {
      title: [o.name, o.time, '开通了', o.title].join(' '),
    }
  })
})

const headMarginTop = computed(() => {
  return -SystemConfig.HeadHeightTotal + 'px'
})

const vipSelected = computed(() => {
  return state.vips.find((o) => o.id === state.vipActiveId)
})

const rightsSelected = computed(() => {
  if (!state.rights) {
    return []
  }
  return state.rights.filter((o) => o.vipIds.includes(state.vipActiveId))
})

function doLogin() {
  requireUserLogin(() => {}, true)
}

async function init() {
  const res = await api.postCached('member_vip/info', {})
  state.title = res.data.title
  state.content = res.data.content
  state.countDown = res.data.countDown
  if (state.countDown > 0) {
    state.countDownEnd = new Date().getTime() + state.countDown * 1000
  }
  state.vips = res.data.vips.filter((o) => !o.isDefault)
  state.rights = res.data.rights
  state.openUsers = res.data.openUsers || []
  for (const v of state.vips) {
    state.vipActiveId = v.id
    doVipActive(v.id)
    break
  }
  state.loading = false
}

function doUpdateVoucher(voucherItems) {
  if (voucherItems.length > 0) {
    state.voucherId = voucherItems[0].id
  } else {
    state.voucherId = 0
  }
  doCalc(state.vipActiveId)
}

function doCalc(vipId) {
  state.vipCalc.type = '-'
  state.vipCalc.price = '-'
  state.vipCalc.expire = '-'
  state.vipActiveId = vipId
  api.post('member_vip/calc', { vipId: state.vipActiveId, voucherId: state.voucherId }).then((res) => {
    state.vipCalc = res.data
  })
  const index = state.vips.findIndex((o) => o.id === vipId)
  state.scrollIntoView = 'item' + index
}

function doVipActive(vipId) {
  state.voucherId = 0
  if (memberVoucherSelectorRef.value) {
    memberVoucherSelectorRef.value.updateItems('MemberVip', { vipId: vipId }, () => {
      doCalc(vipId)
    })
  } else {
    doCalc(vipId)
  }
}

function doPrev() {
  let index = state.vips.findIndex((o) => o.id === state.vipActiveId)
  if (index > 0) {
    doVipActive(state.vips[index - 1].id)
  }
}

function doNext() {
  let index = state.vips.findIndex((o) => o.id === state.vipActiveId)
  if (index < state.vips.length - 1) {
    doVipActive(state.vips[index + 1].id)
  }
}

async function doSubmit() {
  dialog.loadingOn()
  try {
    const res = await api.post('member_vip/buy', {
      vipId: state.vipActiveId,
      voucherId: state.voucherId,
      redirect: router.pathToUrl('/pages/member'),
    })
    dialog.loadingOff()
    router.to(`/brick/module/pay_center/pay?order=${res.data.orderSecretId}`)
  } catch {
    dialog.loadingOff()
  }
}

onMounted(() => {
  Starter.bootComponent(() => {
    init()
  })
  autoSetNavigationBarColor()
  state.countDownTimer = setInterval(() => {
    if (state.countDown > 0) {
      const left = state.countDownEnd - new Date().getTime()
      if (left <= 0) {
        state.countDownTime = '00:00:00.0'
      } else {
        const h = Math.floor(left / 1000 / 60 / 60)
        const m = Math.floor((left / 1000 / 60) % 60)
        const s = Math.floor((left / 1000) % 60)
        const ms = Math.floor((left % 1000) / 100)
        state.countDownTime =
          (h < 10 ? '0' + h : h) +
          ':' +
          (m < 10 ? '0' + m : m) +
          ':' +
          (s < 10 ? '0' + s : s) +
          '.' +
          (ms < 10 ? '0' + ms : ms)
      }
    }
  }, 100)
})

onUnmounted(() => {
  clearInterval(state.countDownTimer)
})
</script>

<style lang="less">
.pb-member-vip {
  .top-bg {
    background: linear-gradient(135deg, #0e081e, #030109);
  }

  .vip-list-container {
    position: relative;

    .nav-item {
      position: absolute;
      top: 50%;
      background: rgba(0, 0, 0, 0.2);
      color: #fff;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      font-size: 1.5rem;
      line-height: 2rem;
      text-align: center;
      margin-top: -1rem;

      &.left {
        left: 0.25rem;
      }

      &.right {
        right: 0.25rem;
      }
    }
  }

  .vip-list {
    padding: 0.5rem 0.5rem;
    white-space: nowrap;

    .item {
      margin: 0.5rem;
      background: #fff;
      box-shadow: 0 0 8px 0 #e5e5e5;
      border-radius: 0.5rem 1.5rem 0.5rem 0.5rem;
      cursor: pointer;
      border: 3px solid #fff;
      position: relative;
      padding: 0.5rem;
      width: 8rem;
      flex-shrink: 0;
      text-align: center;
      color: #552f07;
      display: inline-block;

      .item-active-show {
        display: none;
      }

      &.active {
        border: 3px solid #feca95;
        background: #fcf1e6;

        .item-active-show {
          display: block;
        }
      }

      .title {
        font-weight: bold;
      }

      .price {
        font-size: 1rem;
      }

      .desc {
        font-size: 0.6rem;
        height: 1rem;
        line-height: 1rem;
        overflow: hidden;
        color: var(--color-tertiary);
      }
    }
  }
}
</style>
