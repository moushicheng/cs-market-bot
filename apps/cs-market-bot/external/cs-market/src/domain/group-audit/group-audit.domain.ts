import { Context, Session } from "koishi"
import { ContextKey, ContextRegistry } from "../../infra/context/context"
import OneBotBot, { OneBot } from "koishi-plugin-adapter-onebot"

export class GroupAuditDomain {
  private static instance: GroupAuditDomain
  ctx:Context
  bot:OneBotBot<Context>
  
  private constructor() {
  }
  public static getInstance(): GroupAuditDomain {
    if (!GroupAuditDomain.instance) {
      GroupAuditDomain.instance = new GroupAuditDomain()
    }
    return GroupAuditDomain.instance
  }
  public async init(ctx:Context){
    this.ctx=ctx
    this.bot=ctx.bots.find(item=>item.platform==='onebot') as OneBotBot<Context>
    return this
  }
  

 async getGroupNotice(session: Session){
    const onebotInstance=session.onebot
   if(onebotInstance && onebotInstance.group_id){
     const notices= await onebotInstance.getGroupNotice(onebotInstance.group_id)
   }
  }

  async collectGroupNotice(groupId:number){ 
    const notices= await this.bot.internal.getGroupNotice(groupId)
    return notices
  }
}