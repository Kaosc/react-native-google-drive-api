import type { IListQueryBuilderSource, IListQueryBuilderTarget, TClause, TClauseFunctionCommand, TClauseFunctionWithClause, TKeyOrValue, TListQueryBuilder } from "./types"

const Factory = (): TListQueryBuilder => {
  const queryClauses: TKeyOrValue[] = []

  const addClause: TClauseFunctionWithClause = (...[keyOrValue1, operator, keyOrValue2, valueQuotationFlag = true]) => {
    const isIn = operator === 'in'
    const key = isIn ? keyOrValue2 : keyOrValue1
    const rawValue = isIn ? keyOrValue1 : keyOrValue2
    const shouldQuotateValue = typeof rawValue === 'string' && valueQuotationFlag
    const value = shouldQuotateValue ? `'${rawValue}'` : rawValue

    queryClauses.push(isIn ? value : key)
    queryClauses.push(operator)
    queryClauses.push(isIn ? key : value)

    return implementation
  }

  function clauseFunction(command: TClauseFunctionCommand, ...rest: unknown[]): TListQueryBuilder {
    queryClauses.push(command === 'push' ? '(' : command)

    return rest.length ? addClause(...rest as TClause) : implementation
  }

  const source: IListQueryBuilderSource = {
    and(...clause: unknown[]) { return clauseFunction('and', ...clause) },
    or(...clause: unknown[]) { return clauseFunction('or', ...clause)},
    pop() {
      queryClauses.push(')')

      return implementation
    },
    push(...clause) { return clauseFunction('push', ...clause)},
    toString() {
      const query = queryClauses.join(' ')

      queryClauses.length = 0

      return query
    }
  }

  const target: IListQueryBuilderTarget = (...clause) => addClause(...clause)

  const implementation = Object.assign(target, source)

  return implementation
}

export const ListQueryBuilder = Factory()
