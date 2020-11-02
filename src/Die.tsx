import { ColorHelper } from 'csx'
import React, { FC } from 'react'

import { classes, style, stylesheet } from 'typestyle'

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
export interface DieProps {
  value: number
  dieColor: ColorHelper
  dotColor: ColorHelper
  border?: boolean
  size?: number
  glow?: boolean
}
export const Die: FC<DieProps> = ({ value, dotColor, dieColor, border, size = 60, glow = false }) => (
  <div
    className={classes(
      styles.Die,
      style({
        background: dieColor.toString(),
        width: size,
        height: size,
        borderRadius: size / 6,
        padding: Math.floor(size / 8),
        border: border ? `2px solid ${dotColor.toString()}` : 'none',
        ...(glow ? { boxShadow: `0 0 10px 5px ${dieColor.fade(0.4).toString()}` } : {}),
      }),
    )}>
    {dots[value - 1].map((d, j) => (
      <span
        key={j}
        className={
          d === 1 ? style({ background: dotColor.toString(), borderRadius: 100 }) : style({ visibility: 'hidden' })
        }
      />
    ))}
  </div>
)
