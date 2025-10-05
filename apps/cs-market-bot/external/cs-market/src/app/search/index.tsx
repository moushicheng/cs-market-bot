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
        const skins = await this.getSkinList(session.args[0])
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
  async handleSkinDetail(event: BaseEvent<{
    session:Session
    sessionHook:SessionHook
  }>) {
    // 处理皮肤详情事件
    const skinId=await this.getCurrentSkinId(event.data)
    const sourceDomain = SourceDomain.getInstance()
    const skinDetail=await sourceDomain.getSkinDetail(skinId)
    const goodInfo=skinDetail.data.goods_info
    const result=`
名称: ${goodInfo.name}

buff出售: ${goodInfo.buff_sell_price}￥ ${goodInfo.buff_sell_num}数
buff求购: ${goodInfo.buff_buy_price}￥ ${goodInfo.buff_buy_num}数
uu出售: ${goodInfo.yyyp_sell_price}￥ ${goodInfo.yyyp_sell_num}数
uu求购: ${goodInfo.yyyp_buy_price}￥ ${goodInfo.yyyp_buy_num}数

涨跌价: [7]${goodInfo.sell_price_7}￥ [15]${goodInfo.sell_price_15}￥ [30]${goodInfo.sell_price_30}￥
涨幅率: [7]${goodInfo.sell_price_rate_7}% [15]${goodInfo.sell_price_rate_15}% [30]${goodInfo.sell_price_rate_30}%
    
存世量: ${goodInfo.statistic||'未知'} 件    
    `
    event.data.session.send(<div>
      <img src={goodInfo.img}/>
      {result}
    </div>)
  }

  private async getCurrentSkinId(data:{
    session:Session
    sessionHook:SessionHook
  }) {
    const { session, sessionHook } = data
    const skinIndex=session.content.match(/\d+/)?.[0]
    const skinList=sessionHook.sessionData.skins
    return skinList[Number(skinIndex)-1]
  }

  private async getSkinList(keyword: string) {
    const sourceDomain = SourceDomain.getInstance()
    const skins = await sourceDomain.searchSkinByKeyword(keyword)
    return skins
  }
}
