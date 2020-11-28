import { equals } from 'ramda'
import { RollResult } from './GameModel'

export type RollValuation = 'Success' | 'MixedSuccess' | 'Crit' | 'Miss'

export const valuate = ({ results, isZero }: RollResult): RollValuation => {
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
