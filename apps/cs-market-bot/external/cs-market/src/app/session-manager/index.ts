import { Context, Session } from 'koishi'
import { SessionHookManager } from '../../domain/session/session.domain'

export class SessionManagerApp {
  private sessionManager: SessionHookManager

  constructor() {
    this.sessionManager = SessionHookManager.getInstance()
  }

  registerMessageHandler(ctx: Context) {
    ctx.on('message', async (session: Session) => {
      const matchingSessions = await this.sessionManager.findMatchingSessions(session)
      matchingSessions.forEach(async (session) => {
        await session.remove()
      })
    })
  }
}
