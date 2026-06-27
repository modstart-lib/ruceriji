/**
 * 简单 sprintf 实现 - 适配 Vue3 版本
 * 替代 sprintf-js 依赖
 */
export const SprintfUtil = {
  format(template: string, ...args: any[]): string {
    let i = 0
    return template.replace(/%s|%d|%f|%i/g, () => {
      const arg = args[i++]
      return arg !== undefined ? String(arg) : ''
    })
  },
}

export default SprintfUtil
