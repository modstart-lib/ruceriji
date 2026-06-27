<template name="ImageCropper">
  <view>
    <canvas
      id="image-canvas"
      canvas-id="image-canvas"
      class="image-canvas"
      :style="{ top: cropperTop, height: cropperHeight }"
      disable-scroll="false"
    ></canvas>
    <!-- #ifdef H5 -->
    <canvas
      id="crop-layout-canvas"
      canvas-id="crop-layout-canvas"
      class="crop-layout-canvas"
      :style="{ top: cropperTop, height: cropperHeight }"
      disable-scroll="false"
      @pointerdown="onPointerDown"
      @pointermove.prevent="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel"
    ></canvas>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <canvas
      id="crop-layout-canvas"
      canvas-id="crop-layout-canvas"
      class="crop-layout-canvas"
      :style="{ top: cropperTop, height: cropperHeight }"
      disable-scroll="false"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @wheel.prevent="onWheel"
    ></canvas>
    <!-- #endif -->
    <view class="corp-layout-wrapper" :style="{ display: styleDisplay }">
      <view class="corp-layout">
        <view class="btn-wrapper">
          <view hover-class="hover" :style="{ width: buttonWidth }" @click="doSelectImage()">
            <text>重选</text>
          </view>
          <view hover-class="hover" :style="{ width: buttonWidth }" @click="doClose">
            <text>关闭</text>
          </view>
          <view hover-class="hover" :style="{ width: buttonWidth, display: buttonDisplay }" @click="doRotate">
            <text>旋转</text>
          </view>
          <view hover-class="hover" :style="{ width: buttonWidth }" @click="doSave">
            <text>保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted, toRefs, getCurrentInstance } from 'vue'

defineOptions({ name: 'ImageCropper' })

const instance = getCurrentInstance()
const emit = defineEmits<{
  (e: 'save', payload: { data: string }): void
}>()

const props = defineProps({
  cropWidth: {
    type: String,
    default: '350rpx',
  },
  cropHeight: {
    type: String,
    default: '350rpx',
  },
  cropSaveWidth: {
    type: String,
    default: '300rpx',
  },
  cropSaveHeight: {
    type: String,
    default: '300rpx',
  },
  minScale: {
    type: Number,
    default: 0.3,
  },
  maxScale: {
    type: Number,
    default: 4,
  },
  canScale: {
    type: Boolean,
    default: true,
  },
  canRotate: {
    type: Boolean,
    default: true,
  },
  stretch: {
    type: String,
    default: '',
  },
  lock: {
    type: String,
    default: '',
  },
  quality: {
    type: Number,
    default: 0.9,
  },
  hasTabBar: {
    type: Boolean,
    default: false,
  },
})

const tabHeight = 50

const state = reactive({
  cropperHeight: '0px',
  styleDisplay: 'none',
  cropperTop: '-10000px',
  cropStyle: {},
  buttonWidth: '24%',
  buttonDisplay: 'flex',
  hasImage: false,

  imagePx: 0,
  imagePy: 0,
  imageWidth: 0,
  imageHeight: 0,
  imageWidthRaw: 0,
  imageHeightRaw: 0,
  cropSaveWidthInPx: 0,
  cropSaveHeightInPx: 0,
})
const {
  cropperHeight,
  styleDisplay,
  cropperTop,
  cropStyle,
  buttonWidth,
  buttonDisplay,
  hasImage,
  imagePx,
  imagePy,
  imageWidth,
  imageHeight,
  imageWidthRaw,
  imageHeightRaw,
  cropSaveWidthInPx,
  cropSaveHeightInPx,
} = toRefs(state)

/** H5 等端 Touch 为 clientX/clientY；小程序为 x/y */
function touchXY(t: any): { x: number; y: number } {
  if (!t) return { x: 0, y: 0 }
  const x = t.x ?? t.clientX ?? t.pageX ?? 0
  const y = t.y ?? t.clientY ?? t.pageY ?? 0
  return { x, y }
}

function doWindowResize() {
  let sysInfo = uni.getSystemInfoSync()
  state.platform = sysInfo.platform
  state.pixelRatio = sysInfo.pixelRatio
  state.windowWidth = sysInfo.windowWidth
  // #ifdef H5
  state.drawTop = sysInfo.windowTop
  state.windowHeight = sysInfo.windowHeight + sysInfo.windowBottom
  state.cropperHeight = state.windowHeight - tabHeight + 'px'
  // #endif
  // #ifdef APP-PLUS
  if (state.platform === 'android') {
    state.windowHeight = sysInfo.screenHeight + sysInfo.statusBarHeight
    state.cropperHeight = state.windowHeight - tabHeight + 'px'
  } else {
    state.windowHeight = sysInfo.windowHeight + state.moreHeight
    state.cropperHeight = state.windowHeight - tabHeight + 6 + 'px'
  }
  // #endif
  // #ifdef MP
  state.windowHeight = sysInfo.windowHeight + state.moreHeight
  state.cropperHeight = state.windowHeight - tabHeight - 2 + 'px'
  // #endif
  state.pxRatio = state.windowWidth / 750
  // console.log('doWindowResize',state.pixelRatio,state.windowWidth,state.windowHeight,state.cropperHeight,state.pxRatio)

  props.cropSaveWidth &&
    (state.cropSaveWidthInPx =
      props.cropSaveWidth.indexOf('rpx') >= 0
        ? parseInt(props.cropSaveWidth) * state.pxRatio
        : parseInt(props.cropSaveWidth))
  props.cropSaveHeight &&
    (state.cropSaveHeightInPx =
      props.cropSaveHeight.indexOf('rpx') >= 0
        ? parseInt(props.cropSaveHeight) * state.pxRatio
        : parseInt(props.cropSaveHeight))

  if (state.styleDisplay === 'flex') {
    doDrawInit(true)
  }
}

function doSelectImage(source) {
  source = source || ['album', 'camera']
  if (state.fSelecting) return
  state.fSelecting = true
  setTimeout(() => {
    state.fSelecting = false
  }, 500)

  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: source,
    success: (r) => {
      uni.showLoading({ mask: true })
      let path = (state.imgPath = r.tempFilePaths[0])
      uni.getImageInfo({
        src: path,
        success: (r) => {
          state.imageWidthRaw = r.width
          state.imageHeightRaw = r.height
          state.path = path
          if (!state.hasImage) {
            let style = state.cropStyle || {}
            if (props.cropWidth && props.cropHeight) {
              let cropWidth =
                  props.cropWidth.indexOf('rpx') >= 0
                    ? parseInt(props.cropWidth) * state.pxRatio
                    : parseInt(props.cropWidth),
                cropHeight =
                  props.cropHeight.indexOf('rpx') >= 0
                    ? parseInt(props.cropHeight) * state.pxRatio
                    : parseInt(props.cropHeight)
              style.width = cropWidth + 'px'
              style.height = cropHeight + 'px'
              style.top = (state.windowHeight - cropHeight - tabHeight) / 2 + 'px'
              style.left = (state.windowWidth - cropWidth) / 2 + 'px'
            } else {
              uni.showModal({
                title: '裁剪框的宽或高没有设置',
                showCancel: false,
              })
              return
            }
            state.cropStyle = style
          }

          if (props.hasTabBar) {
            doDrawInit(true)
          } else {
            uni.hideTabBar({
              complete: () => {
                doDrawInit(true)
              },
              fail: () => {
                doDrawInit(true)
              },
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: 'error3',
            duration: 2000,
          })
        },
        complete() {
          uni.hideLoading()
        },
      })
    },
  })
}

function doSave() {
  if (state.fUploading) return
  state.fUploading = true
  setTimeout(() => {
    state.fUploading = false
  }, 1000)

  let style = state.cropStyle,
    x = parseInt(style.left),
    y = parseInt(style.top),
    width = parseInt(style.width),
    height = parseInt(style.height),
    cropSaveWidth = state.cropSaveWidthInPx || width,
    cropSaveHeight = state.cropSaveHeightInPx || height

  // #ifdef H5
  //x *= state.pixelRatio;
  //y *= state.pixelRatio;
  cropSaveWidth = width
  cropSaveHeight = height
  // #endif

  // console.log('corp.1', state.canvasImage)
  // console.log('crop.2', style)
  // console.log('crop.3', x, y, width, height, cropSaveWidth, cropSaveHeight)
  // console.log('crop.4', this)

  uni.showLoading({ mask: true })
  state.styleDisplay = 'none'
  state.cropperTop = '-10000px'
  state.hasImage = false
  // #ifdef H5
  pointerMap.clear()
  // #endif
  uni.canvasToTempFilePath(
    {
      x: x,
      y: y,
      width: width,
      height: height,
      destWidth: cropSaveWidth,
      destHeight: cropSaveHeight,
      canvasId: 'image-canvas',
      fileType: 'png',
      quality: props.quality,
      success: (r) => {
        // #ifdef H5
        emit('save', { data: r.tempFilePath as string })
        // #endif
        // #ifdef MP-WEIXIN
        const base64 = wx.getFileSystemManager().readFileSync(r.tempFilePath, 'base64')
        emit('save', { data: `data:image/png;base64,${base64}` })
        // #endif
        // #ifdef APP-PLUS
        plus.io.resolveLocalFileSystemURL(r.tempFilePath, function (entry) {
          entry.file(function (file) {
            var fileReader = new plus.io.FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onloadend = function (evt) {
              emit('save', { data: (evt.target as FileReader).result as string })
            }
          })
        })
        // #endif
      },
      fail: (res) => {
        uni.showToast({
          title: 'error',
          duration: 2000,
        })
      },
      complete: () => {
        uni.hideLoading()
        if (!props.hasTabBar) {
          uni.showTabBar({ fail: () => {} })
        }
      },
    },
    instance?.proxy
  )
}

function doDrawInit(ini = false) {
  let imageWidthRaw = state.imageWidthRaw,
    imageHeightRaw = state.imageHeightRaw,
    imgRadio = imageWidthRaw / imageHeightRaw,
    imageWidth = state.windowWidth - 40,
    imageHeight = state.windowHeight - tabHeight - 80,
    pixelRatio = state.pixelRatio,
    cropWidth = parseInt(state.cropStyle.width),
    cropHeight = parseInt(state.cropStyle.height)

  state.fixWidth = 0
  state.fixHeight = 0
  state.lckWidth = 0
  state.lckHeight = 0
  switch (props.stretch) {
    case 'x':
      state.fixWidth = 1
      break
    case 'y':
      state.fixHeight = 1
      break
    case 'long':
      if (imgRadio > 1) state.fixWidth = 1
      else state.fixHeight = 1
      break
    case 'short':
      if (imgRadio > 1) state.fixHeight = 1
      else state.fixWidth = 1
      break
    case 'longSel':
      if (cropWidth > cropHeight) state.fixWidth = 1
      else state.fixHeight = 1
      break
    case 'shortSel':
      if (cropWidth > cropHeight) state.fixHeight = 1
      else state.fixWidth = 1
      break
  }
  switch (props.lock) {
    case 'x':
      state.lckWidth = 1
      break
    case 'y':
      state.lckHeight = 1
      break
    case 'long':
      if (imgRadio > 1) state.lckWidth = 1
      else state.lckHeight = 1
      break
    case 'short':
      if (imgRadio > 1) state.lckHeight = 1
      else state.lckWidth = 1
      break
    case 'longSel':
      if (cropWidth > cropHeight) state.lckWidth = 1
      else state.lckHeight = 1
      break
    case 'shortSel':
      if (cropWidth > cropHeight) state.lckHeight = 1
      else state.lckWidth = 1
      break
  }
  if (state.fixWidth) {
    imageWidth = cropWidth
    imageHeight = imageWidth / imgRadio
  } else if (state.fixHeight) {
    imageHeight = cropHeight
    imageWidth = imageHeight * imgRadio
  } else if (imgRadio < 1) {
    if (imageHeightRaw < imageHeight) {
      imageWidth = imageWidthRaw
      imageHeight = imageHeightRaw
    } else {
      imageHeight = imageWidth / imgRadio
    }
  } else {
    if (imageWidthRaw < imageWidth) {
      imageWidth = imageWidthRaw
      imageHeight = imageHeightRaw
    } else {
      imageHeight = imageWidth / imgRadio
    }
  }

  state.scaleSize = 1
  state.rotateDeg = 0
  state.imagePx = (state.windowWidth - imageWidth) / 2
  state.imagePy = (state.windowHeight - imageHeight - tabHeight) / 2
  state.imageWidth = imageWidth
  state.imageHeight = imageHeight

  let style = state.cropStyle,
    left = parseInt(style.left),
    top = parseInt(style.top),
    width = parseInt(style.width),
    height = parseInt(style.height),
    canvas = state.canvas,
    canvasImage = state.canvasImage,
    canvasCropLayout = state.canvasCropLayout

  canvasCropLayout.setLineWidth(3)
  canvasCropLayout.setStrokeStyle('grey')
  canvasCropLayout.setGlobalAlpha(0.4)
  canvasCropLayout.setFillStyle('black')
  canvasCropLayout.strokeRect(left, top, width, height)
  canvasCropLayout.fillRect(0, 0, state.windowWidth, top)
  canvasCropLayout.fillRect(0, top, left, height)
  canvasCropLayout.fillRect(0, top + height, state.windowWidth, state.windowHeight - height - top - tabHeight)
  canvasCropLayout.fillRect(left + width, top, state.windowWidth - width - left, height)
  canvasCropLayout.setStrokeStyle('red')
  canvasCropLayout.moveTo(left + 20, top)
  canvasCropLayout.lineTo(left, top)
  canvasCropLayout.lineTo(left, top + 20)
  canvasCropLayout.moveTo(left + width - 20, top)
  canvasCropLayout.lineTo(left + width, top)
  canvasCropLayout.lineTo(left + width, top + 20)
  canvasCropLayout.moveTo(left + 20, top + height)
  canvasCropLayout.lineTo(left, top + height)
  canvasCropLayout.lineTo(left, top + height - 20)
  canvasCropLayout.moveTo(left + width - 20, top + height)
  canvasCropLayout.lineTo(left + width, top + height)
  canvasCropLayout.lineTo(left + width, top + height - 20)
  canvasCropLayout.stroke()

  canvasCropLayout.draw(false, () => {
    if (ini) {
      state.styleDisplay = 'flex'
      // #ifdef H5
      state.cropperTop = state.drawTop + 'px'
      // #endif
      // #ifndef H5
      state.cropperTop = '0'
      // #endif
      canvasImage.setFillStyle('black')
      doDrawImage()
    }
  })
}

function doDrawImage() {
  let tm_now = Date.now()
  if (tm_now - state.drawTm < 20) return
  state.drawTm = tm_now
  let canvasImage = state.canvasImage
  // console.log('draw', state.windowWidth, state.windowHeight, state.imageWidth, state.imageHeight, state.imagePx, state.imagePy)
  canvasImage.fillRect(0, 0, state.windowWidth, state.windowHeight - tabHeight)
  canvasImage.translate(state.imagePx + state.imageWidth / 2, state.imagePy + state.imageHeight / 2)
  canvasImage.scale(state.scaleSize, state.scaleSize)
  canvasImage.rotate((state.rotateDeg * Math.PI) / 180)
  canvasImage.drawImage(
    state.imgPath,
    -state.imageWidth / 2,
    -state.imageHeight / 2,
    state.imageWidth,
    state.imageHeight
  )
  canvasImage.draw(false)
}

function doClose() {
  state.styleDisplay = 'none'
  state.cropperTop = '-10000px'
  state.hasImage = false
  props.hasTabBar || uni.showTabBar()
  // #ifdef H5
  pointerMap.clear()
  // #endif
}

function doRotate() {
  // #ifdef APP-PLUS
  if (state.platform === 'android') {
    if (state.fRotateing) return
    state.fRotateing = true
    setTimeout(() => {
      state.fRotateing = false
    }, 500)
  }
  // #endif

  state.rotateDeg += 90 - (state.rotateDeg % 90)
  doDrawImage()
}

function onTouchStart(e) {
  let touches = e.touches,
    touch0 = touches[0],
    touch1 = touches[1]

  const p0 = touchXY(touch0)
  const p1 = touch1 ? touchXY(touch1) : null
  state.touch0 = p0
  state.touch1 = p1

  if (p1) {
    let x = p1.x - p0.x,
      y = p1.y - p0.y
    state.fgDistance = Math.sqrt(x * x + y * y)
  }
}

function onTouchMove(e) {
  let touches = e.touches,
    touch0 = touches[0],
    touch1 = touches[1]

  const p0 = touchXY(touch0)
  const p1 = touch1 ? touchXY(touch1) : null

  if (p1) {
    let x = p1.x - p0.x,
      y = p1.y - p0.y,
      fgDistance = Math.sqrt(x * x + y * y),
      scaleSize = 0.005 * (fgDistance - state.fgDistance),
      beScaleSize = state.scaleSize + scaleSize

    do {
      if (!props.canScale) break
      if (beScaleSize < props.minScale) break
      if (beScaleSize > props.maxScale) break
      state.scaleSize = beScaleSize
    } while (0)
    state.fgDistance = fgDistance

    if (Math.abs(p1.x - p0.x) > 1e-6 && props.canRotate && state.touch1 && state.touch0) {
      const prevSlope = (state.touch1.y - state.touch0.y) / (state.touch1.x - state.touch0.x)
      const currSlope = (p1.y - p0.y) / (p1.x - p0.x)
      state.rotateDeg += (Math.atan((currSlope - prevSlope) / (1 + prevSlope * currSlope)) * 180) / Math.PI
      state.touch0 = p0
      state.touch1 = p1
    }

    doDrawImage()
  } else if (state.touch0) {
    let x = p0.x - state.touch0.x,
      y = p0.y - state.touch0.y,
      beX = state.imagePx + x,
      beY = state.imagePy + y
    if (Math.abs(x) < 100 && !state.lckWidth) state.imagePx = beX
    if (Math.abs(y) < 100 && !state.lckHeight) state.imagePy = beY
    state.touch0 = p0
    doDrawImage()
  }
}

function onTouchEnd(e) {
  let touches = e.touches,
    touch0 = touches && touches[0]
  if (touch0) {
    state.touch0 = touchXY(touch0)
    state.touch1 = touches[1] ? touchXY(touches[1]) : null
  } else {
    state.touch0 = null
    state.touch1 = null
  }
}

// #ifdef H5
/** H5 桌面浏览器无 TouchEvent，需用 Pointer 才能拖拽/双指缩放 */
const pointerMap = new Map<number, { x: number; y: number }>()

function onPointerDown(e: PointerEvent) {
  const el = e.currentTarget as unknown as HTMLElement
  el.setPointerCapture?.(e.pointerId)
  pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const list = Array.from(pointerMap.values())
  state.touch0 = list[0] ?? null
  state.touch1 = list[1] ?? null
  if (state.touch0 && state.touch1) {
    const x = state.touch1.x - state.touch0.x
    const y = state.touch1.y - state.touch0.y
    state.fgDistance = Math.sqrt(x * x + y * y)
  }
}

function onPointerMove(e: PointerEvent) {
  if (!pointerMap.has(e.pointerId)) return
  pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const list = Array.from(pointerMap.values())
  const p0 = list[0]
  const p1 = list[1] ?? null
  const p0xy = { x: p0.x, y: p0.y }
  const p1xy = p1 ? { x: p1.x, y: p1.y } : null

  if (p1xy) {
    let x = p1xy.x - p0xy.x,
      y = p1xy.y - p0xy.y,
      fgDistance = Math.sqrt(x * x + y * y),
      scaleSize = 0.005 * (fgDistance - state.fgDistance),
      beScaleSize = state.scaleSize + scaleSize

    do {
      if (!props.canScale) break
      if (beScaleSize < props.minScale) break
      if (beScaleSize > props.maxScale) break
      state.scaleSize = beScaleSize
    } while (0)
    state.fgDistance = fgDistance

    if (Math.abs(p1xy.x - p0xy.x) > 1e-6 && props.canRotate && state.touch1 && state.touch0) {
      const prevSlope = (state.touch1.y - state.touch0.y) / (state.touch1.x - state.touch0.x)
      const currSlope = (p1xy.y - p0xy.y) / (p1xy.x - p0xy.x)
      state.rotateDeg += (Math.atan((currSlope - prevSlope) / (1 + prevSlope * currSlope)) * 180) / Math.PI
      state.touch0 = p0xy
      state.touch1 = p1xy
    }

    doDrawImage()
  } else if (state.touch0) {
    let x = p0xy.x - state.touch0.x,
      y = p0xy.y - state.touch0.y,
      beX = state.imagePx + x,
      beY = state.imagePy + y
    if (Math.abs(x) < 100 && !state.lckWidth) state.imagePx = beX
    if (Math.abs(y) < 100 && !state.lckHeight) state.imagePy = beY
    state.touch0 = p0xy
    doDrawImage()
  }
}

function onPointerUp(e: PointerEvent) {
  pointerMap.delete(e.pointerId)
  const list = Array.from(pointerMap.values())
  if (list[0]) {
    state.touch0 = { x: list[0].x, y: list[0].y }
    state.touch1 = list[1] ? { x: list[1].x, y: list[1].y } : null
  } else {
    state.touch0 = null
    state.touch1 = null
  }
}
// #endif

function onWheel(e: any) {
  // #ifdef H5
  if (!props.canScale) return
  const deltaY = e.detail?.deltaY ?? e.deltaY ?? 0
  const step = -deltaY * 0.0018
  let beScaleSize = state.scaleSize + step
  if (beScaleSize < props.minScale) beScaleSize = props.minScale
  if (beScaleSize > props.maxScale) beScaleSize = props.maxScale
  state.scaleSize = beScaleSize
  doDrawImage()
  // #endif
}

onMounted(() => {
  const vm = instance?.proxy
  state.canvasImage = uni.createCanvasContext('image-canvas', vm)
  state.canvasCropLayout = uni.createCanvasContext('crop-layout-canvas', vm)

  if (props.hasTabBar) {
    state.moreHeight = 0
    doWindowResize()
  } else {
    uni.showTabBar({
      success: () => {
        state.moreHeight = 50
        doWindowResize()
      },
      fail: () => {
        state.moreHeight = 0
        doWindowResize()
      },
    })
  }
})
defineExpose({ doSelectImage })
</script>

<style lang="less">
.image-canvas {
  display: flex;
  position: fixed !important;
  background: #000000;
  left: 0;
  z-index: 100000;
  width: 100%;
}

.my-avatar {
  width: 150rpx;
  height: 150rpx;
  border-radius: 100%;
}

.crop-layout-canvas {
  display: flex;
  position: fixed !important;
  left: 0;
  z-index: 100001;
  width: 100%;
}

.corp-layout-wrapper {
  height: 50px;
  position: fixed !important;
  box-sizing: border-box;
  border: 1px solid #f1f1f1;
  background: #ffffff;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 100009;
  flex-direction: row;
}

.corp-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10rpx 20rpx;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-self: center;
}

.btn-wrapper {
  display: flex;
  flex-direction: row;
  /* #ifndef H5 */
  flex-grow: 1;
  /* #endif */
  /* #ifdef H5 */
  height: 50px;
  /* #endif */
  justify-content: space-between;
}

.btn-wrapper view {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
  border: 1px solid #f1f1f1;
  border-radius: 6%;
}

.hover {
  background: #f1f1f1;
  border-radius: 6%;
}

.clr-wrapper {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.clr-wrapper view {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
  border: 1px solid #f1f1f1;
  border-radius: 6%;
}

.image-color-slider {
  flex-grow: 1;
}
</style>
