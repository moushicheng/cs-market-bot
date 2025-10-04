/**
 * 通用匹配器类型定义
 */

// 基础匹配条件
export interface BaseMatchCondition {
  type: string
  value: any
  operator?: string
}

/**
 * 通用字段匹配条件
 */
export interface FieldMatchCondition extends BaseMatchCondition {
  type: 'field'
  field: string // 字段路径，支持嵌套如 'user.id', 'session.data.status'
  value: any
  operator?: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'notIn' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'notExists'
}

/**
 * 自定义匹配条件
 */
export interface CustomMatchCondition extends BaseMatchCondition {
  type: 'custom'
  name: string // 自定义匹配器名称
  value: any
  config?: Record<string, any> // 额外配置
}

/**
 * 时间范围匹配条件（特殊处理）
 */
export interface TimeRangeMatchCondition extends BaseMatchCondition {
  type: 'timeRange'
  value: {
    start?: string // HH:mm 格式
    end?: string   // HH:mm 格式
    weekdays?: number[] // 0-6, 0是周日
  }
}

// 组合所有匹配条件
export type MatchCondition = 
  | FieldMatchCondition
  | CustomMatchCondition
  | TimeRangeMatchCondition

// 匹配模式配置
export interface MatchPattern {
  /** 匹配条件列表 */
  conditions: MatchCondition[]
  /** 逻辑操作符：AND 或 OR */
  logic: 'AND' | 'OR'
  /** 匹配优先级，数字越小优先级越高 */
  priority?: number
  /** 是否启用 */
  enabled?: boolean
  /** 匹配模式名称 */
  name?: string
  /** 匹配模式描述 */
  description?: string
}

// 匹配上下文 - 现在完全动态
export interface MatchContext {
  /** 当前时间戳 */
  timestamp?: number
  /** 动态数据，可以包含任何字段 */
  [key: string]: any
}

// 匹配结果
export interface MatchResult {
  /** 是否匹配成功 */
  matched: boolean
  /** 匹配的模式 */
  pattern?: MatchPattern
  /** 匹配的分数（用于优先级排序） */
  score?: number
  /** 匹配的详细信息 */
  details?: {
    matchedConditions: MatchCondition[]
    failedConditions: MatchCondition[]
  }
  /** 提取的变量（如正则捕获组） */
  variables?: Record<string, any>
}

/**
 * 自定义匹配器接口
 */
export interface CustomMatcher {
  /** 匹配器名称 */
  name: string
  /** 匹配函数 */
  match(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> }
}

/**
 * 字段访问器接口
 */
export interface FieldAccessor {
  /** 获取字段值 */
  getValue(context: MatchContext, fieldPath: string): any
}