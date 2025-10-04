/**
 * 基于 Node.js EventEmitter 的简单事件总线
 */

import { EventEmitter } from 'events'
import { EventBus as IEventBus, EventHandler, BaseEvent } from './event.types'

/**
 * 简单事件总线实现
 */
export class EventBus extends EventEmitter implements IEventBus {
  private static instance: EventBus

  constructor() {
    super()
    this.setMaxListeners(100) // 增加最大监听器数量
  }

  /**
   * 获取单例实例
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * 发布事件
   */
  emit<T = any>(eventType: string, data?: T): boolean {
    const event: BaseEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: 'event-bus'
    }
    
    return super.emit(eventType, event)
  }

  /**
   * 订阅事件
   */
  on<T = any>(eventType: string, handler: EventHandler<T>): this {
    return super.on(eventType, handler)
  }

  /**
   * 取消订阅
   */
  off<T = any>(eventType: string, handler: EventHandler<T>): this {
    return super.off(eventType, handler)
  }

  /**
   * 一次性订阅
   */
  once<T = any>(eventType: string, handler: EventHandler<T>): this {
    return super.once(eventType, handler)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(eventType?: string): this {
    return super.removeAllListeners(eventType)
  }

  /**
   * 获取监听器数量
   */
  listenerCount(eventType: string): number {
    return super.listenerCount(eventType)
  }

  /**
   * 获取监听器列表
   */
  listeners(eventType: string): EventHandler[] {
    return super.listeners(eventType) as EventHandler[]
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): string[] {
    return this.eventNames().map(name => String(name))
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalListeners: number
    eventTypes: string[]
    listenersByType: Record<string, number>
  } {
    const eventTypes = this.getEventTypes()
    const listenersByType: Record<string, number> = {}
    
    eventTypes.forEach(eventType => {
      listenersByType[eventType] = this.listenerCount(eventType)
    })

    const totalListeners = Object.values(listenersByType).reduce((sum, count) => sum + count, 0)

    return {
      totalListeners,
      eventTypes,
      listenersByType
    }
  }
}

// 导出全局单例实例
export const eventBus = EventBus.getInstance()
