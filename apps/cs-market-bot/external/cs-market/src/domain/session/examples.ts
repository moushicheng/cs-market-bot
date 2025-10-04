import { Matcher } from './matcher'
import { MatchPattern, MatchContext } from './matcher.types'
import { CSMarketMatcher, MessageMatcher, UserPermissionMatcher } from './cs-market-matcher'

/**
 * 匹配器使用示例
 */

// 创建匹配器实例
const matcher = new Matcher()

// 注册业务特定的匹配器
matcher.registerCustomMatcher(new CSMarketMatcher())
matcher.registerCustomMatcher(new MessageMatcher())
matcher.registerCustomMatcher(new UserPermissionMatcher())

// 示例1: 基础字段匹配
const basicPattern: MatchPattern = {
  name: 'basic-user-match',
  description: '基础用户匹配',
  conditions: [
    {
      type: 'field',
      field: 'userId',
      value: '12345',
      operator: 'equals'
    },
    {
      type: 'field',
      field: 'platform',
      value: ['qq', 'wechat'],
      operator: 'in'
    }
  ],
  logic: 'AND',
  priority: 100,
  enabled: true
}

// 示例2: 消息内容匹配
const messagePattern: MatchPattern = {
  name: 'price-query',
  description: '价格查询匹配',
  conditions: [
    {
      type: 'custom',
      name: 'message',
      value: '价格',
      config: { operator: 'contains' }
    },
    {
      type: 'field',
      field: 'user.role',
      value: 'buyer',
      operator: 'equals'
    }
  ],
  logic: 'AND',
  priority: 50,
  enabled: true
}

// 示例3: CS市场业务匹配
const csMarketPattern: MatchPattern = {
  name: 'high-value-item',
  description: '高价值物品匹配',
  conditions: [
    {
      type: 'custom',
      name: 'cs-market',
      value: 1000,
      config: { 
        type: 'itemPrice',
        operator: 'gte'
      }
    },
    {
      type: 'custom',
      name: 'cs-market',
      value: 'weapon',
      config: { 
        type: 'itemCategory',
        operator: 'equals'
      }
    }
  ],
  logic: 'AND',
  priority: 10,
  enabled: true
}

// 示例4: 时间范围匹配
const timePattern: MatchPattern = {
  name: 'business-hours',
  description: '营业时间匹配',
  conditions: [
    {
      type: 'timeRange',
      value: {
        start: '09:00',
        end: '18:00',
        weekdays: [1, 2, 3, 4, 5] // 周一到周五
      }
    }
  ],
  logic: 'AND',
  priority: 200,
  enabled: true
}

// 示例5: 复杂组合匹配
const complexPattern: MatchPattern = {
  name: 'vip-user-trade',
  description: 'VIP用户交易匹配',
  conditions: [
    {
      type: 'custom',
      name: 'user-permission',
      value: 'vip',
      config: { operator: 'has' }
    },
    {
      type: 'field',
      field: 'trade.status',
      value: 'pending',
      operator: 'equals'
    },
    {
      type: 'custom',
      name: 'cs-market',
      value: 500,
      config: { 
        type: 'userBalance',
        operator: 'gte'
      }
    }
  ],
  logic: 'AND',
  priority: 5,
  enabled: true
}

// 添加所有模式到匹配器
matcher.addPattern(basicPattern)
matcher.addPattern( messagePattern)
matcher.addPattern(csMarketPattern)
matcher.addPattern(timePattern)
matcher.addPattern(complexPattern)

// 测试上下文
const testContexts: MatchContext[] = [
  // 基础用户匹配测试
  {
    userId: '12345',
    platform: 'qq',
    timestamp: Date.now()
  },
  
  // 价格查询测试
  {
    message: '这把刀的价格是多少？',
    user: {
      role: 'buyer',
      balance: 1000
    },
    timestamp: Date.now()
  },
  
  // 高价值物品测试
  {
    item: {
      price: 1500,
      category: 'weapon',
      name: 'AK-47'
    },
    user: {
      role: 'buyer',
      balance: 2000
    },
    timestamp: Date.now()
  },
  
  // VIP用户交易测试
  {
    user: {
      role: 'buyer',
      permissions: ['vip', 'premium'],
      balance: 800
    },
    trade: {
      status: 'pending',
      amount: 600
    },
    timestamp: Date.now()
  }
]

// 运行测试
export function runMatcherExamples() {
  console.log('=== 匹配器示例测试 ===\n')
  
  testContexts.forEach((context, index) => {
    console.log(`测试上下文 ${index + 1}:`, JSON.stringify(context, null, 2))
    
    const results = matcher.match(context)
    
    if (results.length > 0) {
      console.log('匹配结果:')
      results.forEach(result => {
        console.log(`- 模式: ${result.pattern?.name}`)
        console.log(`  描述: ${result.pattern?.description}`)
        console.log(`  优先级: ${result.score}`)
        console.log(`  匹配条件: ${result.details?.matchedConditions.length}`)
        if (result.variables) {
          console.log(`  提取变量:`, result.variables)
        }
      })
    } else {
      console.log('无匹配结果')
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
  })
}

// 导出匹配器实例供其他模块使用
export { matcher }
