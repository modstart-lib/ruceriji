/**
 * useRuceriji - 如厕日记应用特定 Composition API
 * 替代 RucerijiMixin, WcAssetMixin, RecordMixin
 */
import { computed } from 'vue'
import { useBizStore } from '../store/app'
import { useRucerijiStore } from '../store/ruceriji'
import { DateUtil } from '@/brick/lib/date-util'
import { fetchStyle, useRucerijiStyle } from './useRucerijiStyle'

export function useRuceriji() {
  const store = useRucerijiStore()

  const recordChanged = computed(() => store.recordChanged)

  function setRecordChanged(val: boolean) {
    store.setRecordChanged(val)
  }

  return { recordChanged, setRecordChanged }
}

export function useWcAsset() {
  const bizStore = useBizStore()

  const biz = computed(() => bizStore.biz)

  const defaultWcImage = computed(() => {
    const b = bizStore.biz
    if (b && b.gender === 'female') {
      return '/static/image/female_nobg_640.png'
    }
    return '/static/image/male_nobg_640.png'
  })

  const defaultAvatarImage = computed(() => {
    const b = bizStore.biz
    if (b && b.gender === 'female') {
      return '/static/image/female_avatar.png'
    }
    return '/static/image/male_avatar.png'
  })

  return { biz, defaultWcImage, defaultAvatarImage }
}

export function useRecord() {
  const { styleData, styleReady } = useRucerijiStyle()

  async function waitStyleReady(): Promise<void> {
    await fetchStyle()
  }

  async function processRecord(record: any | any[]): Promise<any | any[]> {
    await waitStyleReady()
    const style: any[] = styleData.value

    const process = (item: Record<string, any>) => {
      item['_duration'] = DateUtil.formatDuration(item['duration'], {
        isMs: false,
        format: item['duration'] > 3600 ? 'HH时mm分ss秒' : 'mm分ss秒',
      })
      item['_time'] = DateUtil.format(item['time'], 'HH:mm')
      for (const s of style) {
        if (!item[s.name]) continue
        for (const o of s.options) {
          if (o.value === item[s.name]) {
            item['_' + s.name] = o
            break
          }
        }
      }
      const texts: string[] = []
      if (item['_styleShape']) texts.push(item['_styleShape'].label)
      if (item['_styleColor']) texts.push(item['_styleColor'].label)
      if (item['_styleWeight']) texts.push(item['_styleWeight'].label)
      item['_title'] = texts.join(' ')
      return item
    }

    if (Array.isArray(record)) {
      return record.map(process)
    } else {
      return process(record)
    }
  }

  return { styleData, styleReady, waitStyleReady, processRecord }
}
