import { Context, Session } from 'koishi'
import { SessionHook, SessionHookManager } from '../../domain/session/session.domain'
import { SessionType } from '../../infra/types/session'
import { Logic, MatchType, Operator } from '../../infra/types/matcher'
import { SourceDomain } from '../../domain/source/source.domain'
import { EventType } from '../../infra/types/event'
import { BaseEvent } from '../../infra/event'
import { EventHandler, AutoRegister } from '../../infra/event/decorators'

@AutoRegister()
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
        const sourceDomain = SourceDomain.getInstance()
        const skins = await sourceDomain.searchSkinByKeyword(session.args[0])
        const result = skins.map((skin,index) => `${index+1} 名称: ${skin.name}`).join('\n')
        await this.sessionManager.createSession({
          userId: koishiSession.event.user.id,
          channelId: koishiSession.event.channel.id,
          sessionType: SessionType.WaitingSearchKeyword,
          eventType: EventType.SkinDetail,
          sessionData: {
            skins: skins.map(item=>item.id)
          },
          matchPattern: {
            conditions: [
              {
                type: MatchType.FIELD,
                field: 'event.user.id',
                value: koishiSession.event.user.id,
                operator: Operator.EQUALS
              },
              {
                type: MatchType.FIELD,
                field: 'content',
                value: '^\\d+',
                operator: Operator.REGEX
              }
            ],
            logic: Logic.AND,
            priority: 1,
          }
        })
        return result+'\n-----------------⚠⚠⚠⚠⚠⚠------------------\n回复序号查看饰品详情。'
      })
  }
  
  @EventHandler({ eventType: EventType.SkinDetail })
  handleSkinDetail(event: BaseEvent) {
    // 处理皮肤详情事件
    const { sessionHook, session } = event.data
    console.log('处理皮肤详情请求:', sessionHook, session)
  }
  
}
