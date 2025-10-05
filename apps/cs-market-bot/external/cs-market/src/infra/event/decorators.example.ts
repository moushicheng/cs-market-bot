import { EventHandler, AutoRegister } from './decorators'
import { BaseEvent } from './event.types'
import { EventType } from '../../infra/types/event'

/**
 * 使用装饰器的事件处理器示例
 */
@AutoRegister()
export class ExampleEventHandlers {
  
  @EventHandler({ eventType: EventType.SkinDetail })
  handleSkinDetail(event: BaseEvent) {
    console.log('处理皮肤详情事件:', event)
    const { sessionHook, session } = event.data
    console.log('会话钩子:', sessionHook)
    console.log('会话:', session)
  }

  @EventHandler({ 
    eventType: 'user.login', 
    priority: 1 
  })
  handleUserLogin(event: BaseEvent) {
    console.log('用户登录事件:', event.data)
  }

  @EventHandler({ 
    eventType: 'price.update', 
    once: true 
  })
  handlePriceUpdate(event: BaseEvent) {
    console.log('价格更新事件 (只执行一次):', event.data)
  }

  @EventHandler({ 
    eventType: 'market.search',
    priority: 2
  })
  async handleMarketSearch(event: BaseEvent) {
    console.log('市场搜索事件:', event.data)
    // 异步处理示例
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('搜索处理完成')
  }
}

/**
 * 使用示例
 */
export function exampleUsage() {
  // 创建实例，装饰器会自动注册事件处理器
  const handlers = new ExampleEventHandlers()
  
  console.log('事件处理器已自动注册')
  console.log('现在可以发布事件，处理器会自动响应')
}
