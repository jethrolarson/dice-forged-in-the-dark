export type DieType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

/** @deprecated */
export const DieColor = {
  white: 'var(--bg-die-white)',
  yellow: 'var(--bg-die-yellow)',
  red: 'var(--bg-die-red)',
  green: 'var(--bg-die-green)',
  purple: 'var(--bg-die-purple)',
  blue: 'var(--bg-die-blue)',
  black: 'var(--bg-die-black)',
} satisfies Record<DieColorType, string>

export const dieColors = {
  white: 0xd6cfe7,
  yellow: 0xc46536,
  red: 0xc92c2c,
  green: 0x49d08a,
  purple: 0xb867f2,
  blue: 0x1475f2,
  black: 0x0,
}

export type DieColorType = keyof typeof dieColors

export interface DieResult {
  dieColor: DieColorType
  dieType: DieType
  value: number
}

export const colorNameFromHex = (hex: number): DieColorType => {
  for (const k in dieColors) {
    if (hex === dieColors[k as DieColorType]) return k as DieColorType
  }
  return 'white'
}