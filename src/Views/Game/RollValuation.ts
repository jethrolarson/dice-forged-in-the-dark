import { constant } from 'fp-ts/lib/function'
import { equals, max, min, sum, prop, map } from 'ramda'
import { RollResult } from '../../Models/GameModel'
import { DieResult } from '../../Models/Die'
import { ValuationType } from '../../Models/RollConfig'

export type RollValuation = 'Success' | 'MixedSuccess' | 'Crit' | 'Miss' | 'CritFail'

export const valuateActionRoll = ({ diceRolled, isZero }: RollResult): RollValuation => {
  const results = getResults(diceRolled)
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

  const naughts = results.filter(equals(1)).length

  if (naughts > (isZero ? 0 : 1)) return 'CritFail'
  return 'Miss'
}

const getResults = map(prop('value'))

export const sumRoll = ({ diceRolled }: RollResult): string => sum(getResults(diceRolled)).toString()
export const valuateSumRoll = (): RollValuation => 'Success'

export const resistRoll = ({ diceRolled, isZero }: RollResult): string => {
  const results = getResults(diceRolled)
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

const maxValue = (diceRolled: DieResult[]): number => getResults(diceRolled).reduce(max)
const minValue = (diceRolled: DieResult[]): number => getResults(diceRolled).reduce(min)

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
        case 'CritFail':
          return 'Crit Fail'
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
    label: (result): string => maxValue(result.diceRolled).toString(),
  },
  Lowest: {
    valuation: constant('Success'),
    label: (result): string => minValue(result.diceRolled).toString(),
  },
  Ask: {
    valuation: constant('Miss'),
    label: constant('This doesnt make sense'),
  },
}
