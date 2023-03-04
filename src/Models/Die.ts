export type DieType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

export const DieColor = {
  white: 'var(--bg-die-white)',
  yellow: 'var(--bg-die-yellow)',
  red: 'var(--bg-die-red)',
  green: 'var(--bg-die-green)',
  purple: 'var(--bg-die-purple)',
  blue: 'var(--bg-die-blue)',
} as const

export type DieColorType = keyof typeof DieColor

export interface DieResult {
  dieColor: keyof typeof DieColor
  dieType: DieType
  value: number
}
