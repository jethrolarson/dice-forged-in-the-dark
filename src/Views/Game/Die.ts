import React, { FC } from 'react'

import { classes, keyframes, style, stylesheet } from 'typestyle'
import { NestedCSSProperties } from 'typestyle/lib/types'
import { DieColor } from '../../Models/Die'
import { div, h } from '../../util'

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

export const dieColors = ['white', 'green', 'blue', 'purple', 'yellow', 'red'] as const

export const nextColor = (c: keyof typeof DieColor): keyof typeof DieColor => {
  const i = dieColors.indexOf(c) + 1
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return dieColors[i === dieColors.length ? 0 : i]!
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
export const Die: FC<DieProps> = ({ value, dotColor, dieColor, border, size = 60, glow = false, pulse = false }) =>
  div(
    {
      className: classes(
        styles.Die,
        style(
          {
            background: dieColor.toString(),
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
