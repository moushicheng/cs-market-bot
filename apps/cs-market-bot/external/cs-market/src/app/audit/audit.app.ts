import { Context, Session } from "koishi"
import { GroupAuditDomain } from "../../domain/group-audit/group-audit.domain"

export class AuditApp {

  constructor() {
 
  }

  public async registerAudit(ctx: Context) {
    const groupAuditDomain = await GroupAuditDomain.getInstance().init(ctx)
    const notices = await groupAuditDomain.collectGroupNotice(607910031)
    console.log(notices[0].message)
  }
}