import { ColorHelper } from 'csx'
import { FC } from 'react'

import { classes, keyframes, style, stylesheet } from 'typestyle'
import { NestedCSSProperties } from 'typestyle/lib/types'

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
    opacity: 1,
  },

  '70%': {
    opacity: 0.6,
  },

  '100%': {
    opacity: 1,
  },
})
const dropShadow = (dieColor: ColorHelper): NestedCSSProperties => ({
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
      boxShadow: `0 0 10px 5px ${dieColor.fade(0.4).toString()}`,
      animationDuration: '1s',
      animationIterationCount: 'infinite',
    },
  },
})

export interface DieProps {
  value: number
  dieColor: ColorHelper
  dotColor: ColorHelper
  border?: boolean
  size?: number
  glow?: boolean
  pulse?: boolean
}
export const Die: FC<DieProps> = ({ value, dotColor, dieColor, border, size = 60, glow = false, pulse = false }) => (
  <div
    className={classes(
      styles.Die,
      style(
        {
          background: dieColor.toString(),
          width: size,
          height: size,
          borderRadius: size / 6,
          padding: Math.floor(size / 8),
          border: border ? `2px solid ${dotColor.toString()}` : 'none',
        },
        dropShadow(dieColor),
        glow ? { $nest: { '&::after': { opacity: 1 } } } : {},
        pulse ? { $nest: { '&::after': { animationName: pulseAnimation } } } : {},
      ),
    )}>
    {dots[value - 1]?.map((d, j) => (
      <span
        key={j}
        className={
          d === 1 ? style({ background: dotColor.toString(), borderRadius: 100 }) : style({ visibility: 'hidden' })
        }
      />
    ))}
  </div>
)
