/**
 * useBranding - 品牌信息（网站名称 / Logo / 副标题）
 *
 * 默认值写死在代码里；后端接口返回非空值时覆盖显示，为空或接口失败时回退默认。
 */
import { computed } from 'vue'
import zhCN from '@/locales/zh-CN'
import { useConfig } from './useBaseStore'

export const BrandingDefaults = {
  siteName: zhCN.app.name,
  siteLogo: '',
  siteSlogan: '',
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

export function resolveBranding(config: Record<string, any> | null | undefined) {
  return {
    siteName: clean(config?.siteName) || BrandingDefaults.siteName,
    siteLogo: clean(config?.siteLogo) || BrandingDefaults.siteLogo,
    siteSlogan: clean(config?.siteSlogan) || BrandingDefaults.siteSlogan,
  }
}

export function useBranding() {
  const { config } = useConfig()
  return computed(() => resolveBranding(config.value))
}
