import { ColorHelper } from 'csx'

export type DieType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

export const DieColor = {
  white: '#92d2d0',
  yellow: 'hsl(31, 100%, 64%)',
  red: 'hsl(0, 60%, 50%)',
  green: 'hsl(149, 59%, 55%)',
  purple: 'hsl(230, 65%, 64%)',
} as const

export interface DieResult {
  dieColor: ColorHelper
  dieType: DieType
  value: number
}
