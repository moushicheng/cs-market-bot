import { Context, Session } from 'koishi'
import { SessionHookManager } from '../../domain/session/session.domain'
import { EventBus } from '../../infra/event/event-bus'

export class SessionManagerApp {
  private sessionManager: SessionHookManager

  constructor() {
    this.sessionManager = SessionHookManager.getInstance()
  }

  registerMessageHandler(ctx: Context) {
    ctx.on('message', async (session: Session) => {
      const matchingSessions = await this.sessionManager.findMatchingSessions(session)
      //触发事件
      const eventBus=EventBus.getInstance()
      matchingSessions.forEach(async (sessionHook) => {
        eventBus.emit(sessionHook.eventType, {
          sessionHook,
          session
        })
      })
    })
  }
}
