import { constant } from 'fp-ts/lib/function'
import { equals, max, min, sum } from 'ramda'
import { RollResult } from '../../Models/GameModel'
import { ValuationType } from '../../Models/RollConfig'

export type RollValuation = 'Success' | 'MixedSuccess' | 'Crit' | 'Miss'

export const valuateActionRoll = ({ results, isZero }: RollResult): RollValuation => {
  const successes = results.filter(equals(6)).length
  const winThreshold = isZero ? 2 : 1
  if (successes > winThreshold) {
    return 'Crit'
  }
  if (successes >= winThreshold) {
    return 'Success'
  }
  const mixed = results.filter((d) => d > 3).length
  if (mixed >= winThreshold) {
    return 'MixedSuccess'
  }
  return 'Miss'
}

export const sumRoll = ({ results }: RollResult): string => sum(results).toString()
export const valuateSumRoll = ({ results }: RollResult): RollValuation => 'Success'

export const resistRoll = ({ results, isZero }: RollResult): string => {
  const successes = results.filter(equals(6)).length
  const winThreshold = isZero ? 2 : 1
  let stress = 6 - results.reduce(max)
  if (successes > winThreshold) {
    stress = -1
  }
  return `${stress} stress`
}

type ValuationMap = {
  [k in ValuationType]: {
    valuation: (result: RollResult) => RollValuation
    label: (result: RollResult, valuation: RollValuation) => string
  }
}

export const valuationMap: ValuationMap = {
  Action: {
    valuation: valuateActionRoll,
    label: (_, valuation): string => {
      switch (valuation) {
        case 'Crit':
          return 'Crit'
        case 'Success':
          return 'Success'
        case 'MixedSuccess':
          return 'Mixed'
        case 'Miss':
          return 'Miss'
      }
    },
  },
  Resist: {
    valuation: valuateActionRoll,
    label: resistRoll,
  },
  Sum: {
    valuation: valuateSumRoll,
    label: sumRoll,
  },
  Highest: {
    valuation: constant('Success'),
    label: (result): string => result.results.reduce(max).toString(),
  },
  Lowest: {
    valuation: constant('Success'),
    label: (result): string => result.results.reduce(min).toString(),
  },
  Ask: {
    valuation: constant('Miss'),
    label: constant('This doesnt make sense'),
  },
}
