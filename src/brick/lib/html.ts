/**
 * HTML 工具 - 富文本内容适配
 */
export const HtmlUtil = {
  adapt(html: string): string {
    if (!html) return html

    // #ifdef H5
    return html
    // #endif

    // #ifdef MP-WEIXIN
    let newContent = html.replace(/<img[^>]*>/gi, (match) => {
      if (match.search(/style=/gi) === -1) {
        match = match.replace(/\<img/gi, '<img style=""')
      }
      return match
    })
    newContent = newContent.replace(/style="/gi, '$& max-width:100% !important; ')
    newContent = newContent.replace(/<br[^>]*\/>/gi, '')
    return newContent
    // #endif

    // #ifdef APP-PLUS
    return html
    // #endif
  },
}

export default HtmlUtil
