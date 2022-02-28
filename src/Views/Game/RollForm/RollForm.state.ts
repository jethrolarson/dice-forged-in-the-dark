import { DieType, DieColor } from '../../../Models/GameModel'
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
