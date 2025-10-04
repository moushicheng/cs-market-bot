import { CustomMatcher, CustomMatchCondition, MatchContext } from './matcher.types'

/**
 * CS市场业务特定的匹配器
 */
export class CSMarketMatcher implements CustomMatcher {
  name = 'cs-market'

  match(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const { value, config = {} } = condition

    switch (config.type) {
      case 'itemPrice':
        return this.matchItemPrice(value, context, config)
      case 'userBalance':
        return this.matchUserBalance(value, context, config)
      case 'itemCategory':
        return this.matchItemCategory(value, context, config)
      case 'tradeStatus':
        return this.matchTradeStatus(value, context, config)
      default:
        return { matched: false }
    }
  }

  /**
   * 匹配物品价格
   */
  private matchItemPrice(value: any, context: MatchContext, config: any): { matched: boolean; variables?: Record<string, any> } {
    const itemPrice = context.item?.price || context.price
    if (itemPrice === undefined) return { matched: false }

    const operator = config.operator || 'equals'
    const threshold = Number(value)

    switch (operator) {
      case 'equals':
        return { matched: itemPrice === threshold }
      case 'gt':
        return { matched: itemPrice > threshold }
      case 'gte':
        return { matched: itemPrice >= threshold }
      case 'lt':
        return { matched: itemPrice < threshold }
      case 'lte':
        return { matched: itemPrice <= threshold }
      case 'range':
        const min = config.min || 0
        const max = config.max || Infinity
        return { matched: itemPrice >= min && itemPrice <= max }
      default:
        return { matched: false }
    }
  }

  /**
   * 匹配用户余额
   */
  private matchUserBalance(value: any, context: MatchContext, config: any): { matched: boolean; variables?: Record<string, any> } {
    const userBalance = context.user?.balance || context.balance
    if (userBalance === undefined) return { matched: false }

    const operator = config.operator || 'gte'
    const threshold = Number(value)

    switch (operator) {
      case 'equals':
        return { matched: userBalance === threshold }
      case 'gt':
        return { matched: userBalance > threshold }
      case 'gte':
        return { matched: userBalance >= threshold }
      case 'lt':
        return { matched: userBalance < threshold }
      case 'lte':
        return { matched: userBalance <= threshold }
      default:
        return { matched: false }
    }
  }

  /**
   * 匹配物品分类
   */
  private matchItemCategory(value: any, context: MatchContext, config: any): { matched: boolean; variables?: Record<string, any> } {
    const itemCategory = context.item?.category || context.category
    if (!itemCategory) return { matched: false }

    const operator = config.operator || 'equals'

    switch (operator) {
      case 'equals':
        return { matched: itemCategory === value }
      case 'in':
        return { matched: Array.isArray(value) && value.includes(itemCategory) }
      case 'notIn':
        return { matched: Array.isArray(value) && !value.includes(itemCategory) }
      case 'contains':
        return { matched: String(itemCategory).includes(String(value)) }
      default:
        return { matched: false }
    }
  }

  /**
   * 匹配交易状态
   */
  private matchTradeStatus(value: any, context: MatchContext, config: any): { matched: boolean; variables?: Record<string, any> } {
    const tradeStatus = context.trade?.status || context.status
    if (!tradeStatus) return { matched: false }

    const operator = config.operator || 'equals'

    switch (operator) {
      case 'equals':
        return { matched: tradeStatus === value }
      case 'in':
        return { matched: Array.isArray(value) && value.includes(tradeStatus) }
      case 'notIn':
        return { matched: Array.isArray(value) && !value.includes(tradeStatus) }
      default:
        return { matched: false }
    }
  }
}

/**
 * 消息内容匹配器
 */
export class MessageMatcher implements CustomMatcher {
  name = 'message'

  match(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const message = context.message || context.text || context.content
    if (!message) return { matched: false }

    const { value, config = {} } = condition
    const operator = config.operator || 'contains'

    switch (operator) {
      case 'equals':
        return { matched: message === value }
      case 'contains':
        return { matched: message.includes(value) }
      case 'startsWith':
        return { matched: message.startsWith(value) }
      case 'endsWith':
        return { matched: message.endsWith(value) }
      case 'regex':
        try {
          const regex = new RegExp(value, 'i')
          const match = message.match(regex)
          if (match) {
            const variables: Record<string, any> = {}
            // 提取捕获组
            match.forEach((group, index) => {
              if (index > 0) {
                variables[`group${index}`] = group
              }
            })
            return { matched: true, variables }
          }
          return { matched: false }
        } catch {
          return { matched: false }
        }
      default:
        return { matched: false }
    }
  }
}

/**
 * 用户权限匹配器
 */
export class UserPermissionMatcher implements CustomMatcher {
  name = 'user-permission'

  match(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const userRole = context.user?.role || context.role
    const userPermissions = context.user?.permissions || context.permissions || []
    
    if (!userRole && !userPermissions.length) return { matched: false }

    const { value, config = {} } = condition
    const operator = config.operator || 'has'

    switch (operator) {
      case 'has':
        return { matched: userPermissions.includes(value) }
      case 'hasAny':
        return { matched: Array.isArray(value) && value.some(perm => userPermissions.includes(perm)) }
      case 'hasAll':
        return { matched: Array.isArray(value) && value.every(perm => userPermissions.includes(perm)) }
      case 'role':
        return { matched: userRole === value }
      case 'roleIn':
        return { matched: Array.isArray(value) && value.includes(userRole) }
      default:
        return { matched: false }
    }
  }
}
