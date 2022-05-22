import { Acc } from '@fun-land/accessor'
import { DieType, DieColor } from '../../../Models/Die'
import { ValuationType } from '../../../Models/RollConfig'

export type Rollable = { type: DieType; color: keyof typeof DieColor; id?: string }

export interface RollFormState {
  rollType: string
  note: string
  rollState: string[]
  username: string
  valuationType: ValuationType
  dicePool: Rollable[]
}

export const accessDieColor = (idx: number) => Acc<RollFormState>().prop('dicePool').at(idx).prop('color')
