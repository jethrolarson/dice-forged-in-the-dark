import { Component, h } from '@fun-land/fun-web'
import { funState } from '@fun-land/fun-state'
import { DieColor, DieColorType } from '../../../Models/Die'
import { Die, DieVisualState } from '../Die'
import * as styles from './RollLog.css'

const dieStyles = (
  value: number,
  excluded: boolean,
  highest: boolean,
  isLast: boolean,
  dieColor: string,
): { dieColor: string; dotColor: string; border?: boolean; glow?: boolean; pulse?: boolean } => {
  const _color = DieColor[dieColor as DieColorType] ?? dieColor
  if (excluded) {
    return { dieColor: 'transparent', dotColor: _color, border: true }
  }
  if (highest || value === 6) {
    return { dieColor: _color, dotColor: '#000', pulse: isLast }
  }
  return { dieColor: 'transparent', dotColor: _color, border: true }
}

export const ResultDie: Component<{
  value: number
  size: number
  highest: boolean
  excluded: boolean
  isLast: boolean
  dieColor: string
}> = (signal, { value, size, highest, excluded, isLast, dieColor }) => {
  const { border, ...stateProps } = dieStyles(value, excluded, highest, isLast, dieColor)
  const $ = funState<DieVisualState>(stateProps)
  return Die(signal, { value, size, border, $ })
}
