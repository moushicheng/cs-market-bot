import 'reflect-metadata'
import { EventBus } from './event-bus'
import { BaseEvent, EventHandler as IEventHandler } from './event.types'

/**
 * 事件处理器装饰器元数据键
 */
const EVENT_HANDLER_METADATA_KEY = Symbol('eventHandler')

/**
 * 事件处理器装饰器选项
 */
export interface EventHandlerOptions {
  /** 事件类型 */
  eventType: string
  /** 是否只执行一次 */
  once?: boolean
  /** 优先级，数字越小优先级越高 */
  priority?: number
}

/**
 * 事件处理器元数据
 */
interface EventHandlerMetadata {
  eventType: string
  once: boolean
  priority: number
  methodName: string
}

/**
 * 事件处理器装饰器
 * 用于标记类方法为事件处理器
 */
export function EventHandler(options: EventHandlerOptions) {
  return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
    const metadata: EventHandlerMetadata = {
      eventType: options.eventType,
      once: options.once || false,
      priority: options.priority || 0,
      methodName: String(propertyKey)
    }

    // 获取现有的元数据
    const existingMetadata = Reflect.getMetadata(EVENT_HANDLER_METADATA_KEY, target) || []
    existingMetadata.push(metadata)
    
    // 设置元数据
    Reflect.defineMetadata(EVENT_HANDLER_METADATA_KEY, existingMetadata, target)
  }
}

/**
 * 获取类的所有事件处理器元数据
 */
export function getEventHandlers(target: any): EventHandlerMetadata[] {
  return Reflect.getMetadata(EVENT_HANDLER_METADATA_KEY, target) || []
}

/**
 * 事件处理器注册器
 * 用于自动注册类中的事件处理器
 */
export class EventHandlerRegistry {
  private static instance: EventHandlerRegistry
  private eventBus: EventBus
  private registeredHandlers: Map<string, IEventHandler[]> = new Map()

  constructor() {
    this.eventBus = EventBus.getInstance()
  }

  static getInstance(): EventHandlerRegistry {
    if (!EventHandlerRegistry.instance) {
      EventHandlerRegistry.instance = new EventHandlerRegistry()
    }
    return EventHandlerRegistry.instance
  }

  /**
   * 注册类中的所有事件处理器
   */
  registerEventHandlers(instance: any): void {
    const metadata = getEventHandlers(instance.constructor.prototype)
    
    metadata.forEach(({ eventType, once, priority, methodName }) => {
      const handler = instance[methodName].bind(instance)
      
      // 包装处理器以支持优先级
      const wrappedHandler = (event: BaseEvent) => {
        try {
          return handler(event)
        } catch (error) {
          console.error(`事件处理器 ${eventType}.${methodName} 执行失败:`, error)
        }
      }

      // 注册到事件总线
      if (once) {
        this.eventBus.once(eventType, wrappedHandler)
      } else {
        this.eventBus.on(eventType, wrappedHandler)
      }

      // 记录已注册的处理器
      if (!this.registeredHandlers.has(eventType)) {
        this.registeredHandlers.set(eventType, [])
      }
      this.registeredHandlers.get(eventType)!.push(wrappedHandler)
    })
  }

  /**
   * 取消注册类中的所有事件处理器
   */
  unregisterEventHandlers(instance: any): void {
    const metadata = getEventHandlers(instance.constructor.prototype)
    
    metadata.forEach(({ eventType, methodName }) => {
      const handlers = this.registeredHandlers.get(eventType) || []
      const handler = handlers.find(h => h.name === methodName)
      
      if (handler) {
        this.eventBus.off(eventType, handler)
        // 从记录中移除
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    })
  }

  /**
   * 获取已注册的处理器统计信息
   */
  getRegistryStats(): {
    totalHandlers: number
    handlersByEvent: Record<string, number>
    registeredEvents: string[]
  } {
    const handlersByEvent: Record<string, number> = {}
    const registeredEvents: string[] = []

    this.registeredHandlers.forEach((handlers, eventType) => {
      handlersByEvent[eventType] = handlers.length
      registeredEvents.push(eventType)
    })

    const totalHandlers = Object.values(handlersByEvent).reduce((sum, count) => sum + count, 0)

    return {
      totalHandlers,
      handlersByEvent,
      registeredEvents
    }
  }
}

/**
 * 自动注册装饰器
 * 用于在类实例化时自动注册事件处理器
 */
export function AutoRegister() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        const registry = EventHandlerRegistry.getInstance()
        registry.registerEventHandlers(this)
      }
    }
  }
}
