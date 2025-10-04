import { Context } from 'koishi'
import { CSQAQClient } from '@qq/csqaq-sdk'
import { getRedisClient } from './infra/redis/redis'
import { SessionHookManager } from './domain/session/session.domain'
export const name = 'example'
const token = process.env.CSQAQ_TOKEN
const client = new CSQAQClient({
  token,
})
export function apply(ctx: Context) {
  // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  ctx.on('message', (session) => {
    if (session.content === '天王盖地虎') {
      session.send('宝塔镇河妖')
    }
  })

  ctx.command('search <keyword> 搜索cs市场饰品信息')
  .alias('搜索')
  .action(async (session:) => {
   const sessionManager = SessionHookManager.getInstance()
   sessionManager.createSession({
    userId: session.userId,
    
   })
    return '114514'
  })
}