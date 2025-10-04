import { Context } from 'koishi'
import { SessionHookManager } from '../../domain/session/session.domain'
import { SessionType } from '../../infra/types/session'
import { MatchType, Operator } from '../../infra/types/matcher'

export class SearchApp {
  private sessionManager: SessionHookManager

  constructor() {
    this.sessionManager = SessionHookManager.getInstance()
  }

  registerSearchCommand(ctx: Context) {
    ctx.command('search <keyword> 搜索cs市场饰品信息')
      .alias('搜索')
      .action(async (session) => {
        const koishiSession = session.session
        this.sessionManager.createSession({
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
}
