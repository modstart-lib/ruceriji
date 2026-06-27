import { ref } from 'vue'
import { api } from '@/brick/lib/api'

const styleData = ref<any[]>([])
const styleReady = ref(false)
let fetchPromise: Promise<any[]> | null = null

export function fetchStyle(): Promise<any[]> {
  if (fetchPromise) return fetchPromise
  fetchPromise = (async () => {
    try {
      const res = await api.post('ruceriji/record/style', {}, null, null, { silent: true })
      styleData.value = res.data.style || []
      styleReady.value = true
      return styleData.value
    } catch {
      styleData.value = []
      styleReady.value = true
      return []
    }
  })()
  return fetchPromise
}

export function useRucerijiStyle() {
  return { styleData, styleReady, fetchStyle }
}
