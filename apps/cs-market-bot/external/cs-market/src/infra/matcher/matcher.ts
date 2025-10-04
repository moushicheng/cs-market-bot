import { 
  MatchCondition, 
  MatchPattern, 
  MatchContext, 
  MatchResult,
  FieldMatchCondition,
  CustomMatchCondition,
  TimeRangeMatchCondition,
  CustomMatcher,
  FieldAccessor,
  Operator
} from '../types/matcher'

/**
 * 默认字段访问器
 */
class DefaultFieldAccessor implements FieldAccessor {
  getValue(context: MatchContext, fieldPath: string): any {
    const parts = fieldPath.split('.')
    let value = context
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }
    
    return value
  }
}

/**
 * 通用匹配器核心实现
 */
export class Matcher {
  private patterns: MatchPattern[] = []
  private customMatchers: Map<string, CustomMatcher> = new Map()
  private fieldAccessor: FieldAccessor = new DefaultFieldAccessor()

  /**
   * 设置字段访问器
   */
  setFieldAccessor(accessor: FieldAccessor): void {
    this.fieldAccessor = accessor
  }

  /**
   * 注册自定义匹配器
   */
  registerCustomMatcher(matcher: CustomMatcher): void {
    this.customMatchers.set(matcher.name, matcher)
  }

  /**
   * 移除自定义匹配器
   */
  unregisterCustomMatcher(name: string): void {
    this.customMatchers.delete(name)
  }

  /**
   * 添加匹配模式
   */
  addPattern(pattern: MatchPattern): void {
    this.patterns.push(pattern)
    // 按优先级排序
    this.patterns.sort((a, b) => (a.priority || 999) - (b.priority || 999))
  }

  /**
   * 移除匹配模式
   */
  removePattern(name: string): void {
    this.patterns = this.patterns.filter(p => p.name !== name)
  }

  /**
   * 清空所有匹配模式
   */
  clearPatterns(): void {
    this.patterns = []
  }

  /**
   * 获取所有匹配模式
   */
  getPatterns(): MatchPattern[] {
    return [...this.patterns]
  }

  /**
   * 匹配上下文
   */
  match(context: MatchContext): MatchResult[] {
    const results: MatchResult[] = []

    for (const pattern of this.patterns) {
      if (pattern.enabled===false) continue
      const result = this.matchPattern(pattern, context)
      if (result.matched) {
        results.push(result)
      }
    }

    return results
  }

  /**
   * 匹配单个模式
   */
  private matchPattern(pattern: MatchPattern, context: MatchContext): MatchResult {
    const matchedConditions: MatchCondition[] = []
    const failedConditions: MatchCondition[] = []
    const variables: Record<string, any> = {}
    for (const condition of pattern.conditions) {
      const conditionResult = this.matchCondition(condition, context)
      if (conditionResult.matched) {
        matchedConditions.push(condition)
        if (conditionResult.variables) {
          Object.assign(variables, conditionResult.variables)
        }
      } else {
        failedConditions.push(condition)
      }
    }

    // 根据逻辑操作符判断是否匹配
    let matched = false
    if (pattern.logic === 'AND') {
      matched = failedConditions.length === 0
    } else if (pattern.logic === 'OR') {
      matched = matchedConditions.length > 0
    }

    return {
      matched,
      pattern,
      score: pattern.priority || 999,
      details: {
        matchedConditions,
        failedConditions
      },
      variables: Object.keys(variables).length > 0 ? variables : undefined
    }
  }

  /**
   * 匹配单个条件
   */
  private matchCondition(condition: MatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    switch (condition.type) {
      case 'field':
        return this.matchField(condition as FieldMatchCondition, context)
      case 'custom':
        return this.matchCustom(condition as CustomMatchCondition, context)
      case 'timeRange':
        return this.matchTimeRange(condition as TimeRangeMatchCondition, context)
      default:
        return { matched: false }
    }
  }

  /**
   * 通用字段匹配
   */
  private matchField(condition: FieldMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const fieldValue = this.fieldAccessor.getValue(context, condition.field)
    const expectedValue = condition.value
    const operator = condition.operator || 'equals'

    // 如果字段不存在
    if (fieldValue === undefined) {
      return operator === 'notExists' ? { matched: true } : { matched: false }
    }

    // 如果期望字段不存在
    if (operator === 'exists') {
      return { matched: fieldValue !== undefined }
    }

    // 如果期望字段不存在
    if (operator === 'notExists') {
      return { matched: fieldValue === undefined }
    }

    // 转换为字符串进行比较（适用于大多数情况）
    const fieldStr = String(fieldValue)
    const expectedStr = String(expectedValue)

    switch (operator) {
      case Operator.EQUALS:
        return { matched: fieldValue === expectedValue }
      case Operator.NOT_EQUALS:
        return { matched: fieldValue !== expectedValue }
      case Operator.CONTAINS:
        return { matched: fieldStr.includes(expectedStr) }
      case Operator.STARTS_WITH:
        return { matched: fieldStr.startsWith(expectedStr) }
      case Operator.ENDS_WITH:
        return { matched: fieldStr.endsWith(expectedStr) }
      case Operator.REGEX:
        try {
          const regex = new RegExp(expectedStr, 'i')
          const match = fieldStr.match(regex)
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
      case 'in':
        return { matched: Array.isArray(expectedValue) && expectedValue.includes(fieldValue) }
      case 'notIn':
        return { matched: Array.isArray(expectedValue) && !expectedValue.includes(fieldValue) }
      case 'gt':
        return { matched: Number(fieldValue) > Number(expectedValue) }
      case 'gte':
        return { matched: Number(fieldValue) >= Number(expectedValue) }
      case 'lt':
        return { matched: Number(fieldValue) < Number(expectedValue) }
      case 'lte':
        return { matched: Number(fieldValue) <= Number(expectedValue) }
      default:
        return { matched: false }
    }
  }

  /**
   * 自定义匹配
   */
  private matchCustom(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const matcher = this.customMatchers.get(condition.name)
    if (!matcher) {
      console.warn(`Custom matcher '${condition.name}' not found`)
      return { matched: false }
    }

    try {
      return matcher.match(condition, context)
    } catch (error) {
      console.error(`Error in custom matcher '${condition.name}':`, error)
      return { matched: false }
    }
  }

  /**
   * 时间范围匹配
   */
  private matchTimeRange(condition: TimeRangeMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    const now = new Date(context.timestamp || Date.now())
    const { start, end, weekdays } = condition.value

    // 检查星期几
    if (weekdays && weekdays.length > 0) {
      const currentWeekday = now.getDay()
      if (!weekdays.includes(currentWeekday)) {
        return { matched: false }
      }
    }

    // 检查时间段
    if (start || end) {
      const currentTime = now.getHours() * 60 + now.getMinutes()
      
      if (start) {
        const [startHour, startMinute] = start.split(':').map(Number)
        const startTime = startHour * 60 + startMinute
        if (currentTime < startTime) {
          return { matched: false }
        }
      }

      if (end) {
        const [endHour, endMinute] = end.split(':').map(Number)
        const endTime = endHour * 60 + endMinute
        if (currentTime > endTime) {
          return { matched: false }
        }
      }
    }

    return { matched: true }
  }
}