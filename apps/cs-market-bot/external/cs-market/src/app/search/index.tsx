import { Context, Session } from 'koishi'
import { SessionHook, SessionHookManager } from '../../domain/session/session.domain'
import { SessionType } from '../../infra/types/session'
import { Logic, MatchType, Operator } from '../../infra/types/matcher'
import { SourceDomain } from '../../domain/source/source.domain'
import { EventType } from '../../infra/types/event'
import { BaseEvent } from '../../infra/event'
import { EventHandler, AutoRegister } from '../../infra/event/decorators'
import { getRedis, getRedisJson } from '../../infra/redis/redis'

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
        const skins = await this.getSkinList(session.args.join(' '))
        if (skins.length === 0) {
          return <div><at id={koishiSession.event.user.id} />没有找到饰品</div>
        }
        if (skins.length === 1) {
          const detail = await this.getSkinDetail(Number(skins[0].id))
          return <div>
            <img src={detail.img} />
            {detail.result}
          </div>
        }

        const result = skins.map((skin, index) => `${index + 1} 名称: ${skin.value}`).join('\n')
        await this.sessionManager.createSession({
          userId: koishiSession.event.user.id,
          channelId: koishiSession.event.channel.id,
          sessionType: SessionType.WaitingSearchKeyword,
          eventType: EventType.SkinDetail,
          sessionData: {
            skins: skins.map(item => item.id)
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
                value: '(\\d+)|(search)|(搜索)',
                operator: Operator.REGEX
              }
            ],
            logic: Logic.AND,
            priority: 1,
          }
        })
        return result + '\n-----------------⚠⚠⚠⚠⚠⚠------------------\n回复序号查看饰品详情。'
      })
  }

  @EventHandler({ eventType: EventType.SkinDetail })
  async handleSkinDetail(event: BaseEvent<{
    session: Session
    sessionHook: SessionHook
  }>) {
    const isSecondSearch = await this.checkIsSecondSearch(event.data)
    if (isSecondSearch) {
      await event.data.sessionHook.remove()
      return;
    }

    // 处理皮肤详情事件
    const skinId = await this.getCurrentSkinId(event.data)
    if (!skinId) {
      // 如果无法获取皮肤ID，可能是无效输入
      event.data.session.send('未找到该饰品')
      await event.data.sessionHook.remove()
      return;
    }

    const detail = await this.getSkinDetail(skinId)

    event.data.session.send(<div>
      <img src={detail.img} />
      {detail.result}
    </div>)

    await event.data.sessionHook.remove()
  }

  private async getSkinDetail(skinId: number) {
    const sourceDomain = SourceDomain.getInstance()
    const skinDetail = await sourceDomain.getSkinDetail(skinId)
    const goodInfo = skinDetail.data.goods_info
    const result = `
    名称: ${goodInfo.name}
    
    buff出售: ${goodInfo.buff_sell_price}￥ ${goodInfo.buff_sell_num}个
    buff求购: ${goodInfo.buff_buy_price}￥ ${goodInfo.buff_buy_num}个
    uu出售: ${goodInfo.yyyp_sell_price}￥ ${goodInfo.yyyp_sell_num}个
    uu求购: ${goodInfo.yyyp_buy_price}￥ ${goodInfo.yyyp_buy_num}个
    
    涨跌价/涨幅率: 
      [1日] ${goodInfo.sell_price_1}￥ / ${goodInfo.sell_price_rate_1}% 
      [7日] ${goodInfo.sell_price_7}￥ / ${goodInfo.sell_price_rate_7}% 
      [15日] ${goodInfo.sell_price_15}￥ / ${goodInfo.sell_price_rate_15}% 
      [30日] ${goodInfo.sell_price_30}￥ / ${goodInfo.sell_price_rate_30}%
      [90日] ${goodInfo.sell_price_90}￥ / ${goodInfo.sell_price_rate_90}%
        
    存世量: ${goodInfo.statistic || '未知'} 件    
        `
    return {
      result,
      img: goodInfo.img
    }
  }


  private async checkIsSecondSearch(data: {
    session: Session
    sessionHook: SessionHook
  }) {
    const { session } = data
    const userSessionId = await getRedis(`session:user:${session.event.user.id}`)
    const isSearch = ['search', '搜索'].findIndex(item => session.content.includes(item)) !== -1
    // 如果用户有活跃会话，并且输入了搜索命令，则认为是第二次搜索
    return userSessionId && isSearch
  }

  private async getCurrentSkinId(data: {
    session: Session
    sessionHook: SessionHook
  }) {
    const { session, sessionHook } = data
    const skinIndex = session.content.match(/\d+/)?.[0]
    
    if (!skinIndex) {
      return null
    }
    
    const skinList = sessionHook.sessionData.skins
    const index = Number(skinIndex) - 1
    
    // 检查索引是否有效
    if (index < 0 || index >= skinList.length) {
      return null
    }
    
    return skinList[index]
  }

  private async getSkinList(keyword: string) {
    const sourceDomain = SourceDomain.getInstance()
    const skins = await sourceDomain.suggestSkinByKeyword(keyword)
    return skins
  }
}
