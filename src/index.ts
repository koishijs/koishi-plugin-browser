import { Context } from 'koishi'
import canvas from './canvas'
import html from './html'

export const name = 'browser'

export function apply(ctx: Context) {
  ctx.plugin(canvas)
  ctx.plugin(html)
}
