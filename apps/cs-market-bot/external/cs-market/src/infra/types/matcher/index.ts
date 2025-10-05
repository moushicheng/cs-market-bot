/**
 * 通用匹配器类型定义
 */

// 匹配类型枚举
export enum MatchType {
  FIELD = 'field',
  CUSTOM = 'custom',
  TIME_RANGE = 'timeRange'
}

// 操作符枚举
export enum Operator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  REGEX = 'regex',
  IN = 'in',
  NOT_IN = 'notIn',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists'
}

// 基础匹配条件
export interface BaseMatchCondition {
  type: MatchType
  value: any
  operator?: Operator
}

/**
 * 通用字段匹配条件
 */
export interface FieldMatchCondition extends BaseMatchCondition {
  type: MatchType.FIELD
  field: string // 字段路径，支持嵌套如 'user.id', 'session.data.status'
  value: any
  operator?: Operator
}

/**
 * 自定义匹配条件
 */
export interface CustomMatchCondition extends BaseMatchCondition {
  type: MatchType.CUSTOM
  name: string // 自定义匹配器名称
  value: any
  config?: Record<string, any> // 额外配置
}

/**
 * 时间范围匹配条件（特殊处理）
 */
export interface TimeRangeMatchCondition extends BaseMatchCondition {
  type: MatchType.TIME_RANGE
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

export enum Logic {
  AND = 'AND',
  OR = 'OR'
}

// 匹配模式配置
export interface MatchPattern {
  /** 匹配条件列表 */
  conditions: MatchCondition[]
  /** 逻辑操作符：AND 或 OR */
  logic: Logic
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
