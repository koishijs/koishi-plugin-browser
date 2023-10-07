import { Context, h, hyphenate } from 'koishi'

function transformStyle(source: {}, base = {}) {
  return Object.entries({ ...base, ...source }).map(([key, value]) => {
    return `${hyphenate(key)}: ${Array.isArray(value) ? value.join(', ') : value}`
  }).join('; ')
}

export default function (ctx: Context) {
  ctx.component('html', async (attrs, children, session) => {
    const head: h[] = []

    const transform = (element: h) => {
      if (element.type === 'head') {
        head.push(...element.children)
        return
      }
      const attrs = { ...element.attrs }
      if (typeof attrs.style === 'object') {
        attrs.style = transformStyle(attrs.style)
      }
      return h(element.type, attrs, element.children.map(transform).filter(Boolean))
    }

    const bodyStyle = typeof attrs.style === 'object'
      ? transformStyle({ display: 'inline-block' }, attrs.style)
      : ['display: inline-block', attrs.style].filter(Boolean).join('; ')
    let content = children.map(transform).filter(Boolean).join('')
    const lang = attrs.lang ? ` lang="${attrs.lang}"` : ''
    content = `<html${lang}>
      <head>${head.join('')}</head>
      <body style="${bodyStyle}">${content}</body>
    </html>`
    return h('iframe', { content })
  })
}
