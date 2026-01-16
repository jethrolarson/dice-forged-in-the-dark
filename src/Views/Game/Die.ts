import { Component, h } from '@fun-land/fun-web'
import { classes } from '../../util'
import { DieColorType } from '../../Models/Die'
import { FunRead } from '@fun-land/fun-state'
import { styles } from './Die.css'

// prettier-ignore
const dots = [
  [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0,
  ],
  [
    1, 0, 0,
    0, 0, 0,
    0, 0, 1,
  ],
  [
    0, 0, 1,
    0, 1, 0,
    1, 0, 0,
  ],
  [
    1, 0, 1,
    0, 0, 0,
    1, 0, 1,
  ],
  [
    1, 0, 1,
    0, 1, 0,
    1, 0, 1,
  ],
  [
    1, 0, 1,
    1, 0, 1,
    1, 0, 1,
  ],
]

export const availableDieColors = ['white', 'green', 'blue', 'purple', 'yellow', 'red'] as const

export const nextColor = (c: DieColorType): Exclude<DieColorType, 'black'> => {
  if (c === 'black') return 'white' //exluding red as it's the 0d color
  const i = availableDieColors.indexOf(c) + 1
  return availableDieColors[i === availableDieColors.length ? 0 : i]!
}

export interface DieVisualState {
  dieColor: string
  dotColor: string
  glow?: boolean
  pulse?: boolean
}

export interface DieProps {
  value: number
  border?: boolean
  size?: number
  $: FunRead<DieVisualState>
}
export const Die: Component<DieProps> = (
  signal,
  { value, border, size = 60, $ },
) => {
  const dotElements = dots[value - 1]?.map((d, j) =>
    h('span', { key: j }),
  )

  const dieElement = h('div', {}, dotElements)

  // Watch state and update styling (emits initial value)
  $.watch(signal, ({ dieColor, dotColor, glow, pulse }) => {
    dieElement.className = classes(
      styles.Die,
      styles.dieGlow,
      glow && styles.dieGlowActive,
      pulse && styles.diePulse,
    )
    dieElement.style.cssText = `
      background: ${dieColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size / 8}px;
      padding: ${Math.floor(size / 8)}px;
      border: ${border ? `2px solid ${dotColor.toString()}` : 'none'};
      --die-color: ${dieColor};
    `
    
    dotElements?.forEach((dotElement, j) => {
      const d = dots[value - 1]?.[j]
      if (d === 1) {
        dotElement.className = ''
        dotElement.style.cssText = `background: ${dotColor.toString()}; border-radius: 100%;`
      } else {
        dotElement.className = ''
        dotElement.style.cssText = 'visibility: hidden;'
      }
    })
  })

  return dieElement
}