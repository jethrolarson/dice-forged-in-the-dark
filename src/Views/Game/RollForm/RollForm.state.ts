import { Acc } from '@fun-land/accessor'
import { ValuationType } from '../../../Models/RollConfig'
import { Rollable } from './DicePool'

export interface RollFormState {
  rollType: string
  note: string
  rollState: string[]
  username: string
  valuationType: ValuationType
  dicePool: Rollable[]
}

export const accessDieColor = (idx: number) => Acc<RollFormState>().prop('dicePool').at(idx).prop('color')
