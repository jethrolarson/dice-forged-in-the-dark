import { Component, h } from '@fun-land/fun-web'
import { classes, keyframes, style, stylesheet } from 'typestyle'
import { NestedCSSProperties } from 'typestyle/lib/types'
import { DieColorType } from '../../Models/Die'

const styles = stylesheet({
  Die: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 2,
  },
})

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
const pulseAnimation = keyframes({
  '0%': {
    opacity: 0.6,
  },

  '70%': {
    opacity: 0.1,
  },

  '100%': {
    opacity: 0.6,
  },
})
const dropShadow = (dieColor: string): NestedCSSProperties => ({
  position: 'relative',
  $nest: {
    '&::after': {
      content: "''",
      position: 'absolute',
      zIndex: 0,
      width: '100%',
      height: '100%',
      borderRadius: '5px',
      opacity: 0,
      boxShadow: `0 0 10px 5px ${dieColor}`,
      animationDuration: '1s',
      animationIterationCount: 'infinite',
    },
  },
})

export const availableDieColors = ['white', 'green', 'blue', 'purple', 'yellow', 'red'] as const

export const nextColor = (c: DieColorType): Exclude<DieColorType, 'black'> => {
  if (c === 'black') return 'white' //exluding red as it's the 0d color
  const i = availableDieColors.indexOf(c) + 1
  return availableDieColors[i === availableDieColors.length ? 0 : i]!
}

export interface DieProps {
  value: number
  dieColor: string
  dotColor: string
  border?: boolean
  size?: number
  glow?: boolean
  pulse?: boolean
}
export const Die: Component<DieProps> = (
  signal,
  { value, dotColor, dieColor, border, size = 60, glow = false, pulse = false },
) =>
  h(
    'div',
    {
      className: classes(
        styles.Die,
        style(
          {
            background: dieColor,
            width: size,
            height: size,
            borderRadius: size / 8,
            padding: Math.floor(size / 8),
            border: border ? `2px solid ${dotColor.toString()}` : 'none',
          },
          dropShadow(dieColor),
          glow ? { $nest: { '&::after': { opacity: 1 } } } : {},
          pulse ? { $nest: { '&::after': { animationName: pulseAnimation } } } : {},
        ),
      ),
    },
    dots[value - 1]?.map((d, j) =>
      h('span', {
        key: j,
        className:
          d === 1 ? style({ background: dotColor.toString(), borderRadius: 100 }) : style({ visibility: 'hidden' }),
      }),
    ),
  )
