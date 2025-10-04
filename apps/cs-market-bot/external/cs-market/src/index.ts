import { Context, Session } from 'koishi'
import { CSQAQClient } from '@qq/csqaq-sdk'
import { getRedisClient } from './infra/redis/redis'
import { SessionHookManager } from './domain/session/session.domain'
import { KoishiSession, SessionType } from './infra/types/session'
import { MatchType, Operator } from './infra/types/matcher'
export const name = 'example'
const token = process.env.CSQAQ_TOKEN
const client = new CSQAQClient({
  token,
})
export function apply(ctx: Context) {

  ctx.on('message', async (session:Session) => {

    const sessionManager = SessionHookManager.getInstance()
    const matchingSessions = await sessionManager.findMatchingSessions(session)
    matchingSessions.forEach(async (session) => {
      await session.remove()
    })
  })
  ctx.command('search <keyword> 搜索cs市场饰品信息')
  .alias('搜索')
  .action(async (session) => {
    const koishiSession = session.session
    const sessionManager = SessionHookManager.getInstance()
    sessionManager.createSession({
      userId: koishiSession.event.user.id,
      channelId: koishiSession.event.channel.id,
      sessionType: SessionType.WaitingSearchKeyword,
      sessionContext: {},
      eventType: 'message',
      sessionData: {},
      matchPattern: {
        conditions: [
        {
          type: MatchType.FIELD,
          field: 'event.user.id',
          value: 'Alice',
          operator: Operator.EQUALS
        },
        ],
        logic: 'AND',
        priority: 1,
      },
      timestamp: Date.now()
    })
    return '114514'
  })
}