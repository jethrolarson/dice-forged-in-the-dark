import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { repeat } from 'ramda'
import React, { FC, useEffect } from 'react'
import { stylesheet } from 'typestyle'
import { NumberSpinner } from '../../../components/NumberSpinner'
import { DieType, DieColor } from '../../../Models/Die'
import { ModifierT } from '../../../Models/RollConfig'
import { label, e, div } from '../../../util'

const styles = stylesheet({
  label: {
    margin: '0 0 4px',
    fontSize: '1.17rem',
  },
})
export const Modifier = ({
  setDice,
  section,
  state,
}: {
  section: ModifierT
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
  state?: FunState<string>
}) => {
  const updateDice = (v: number) => {
    setDice(section.name, repeat(section.dieType, v), section.dieColor)
    v !== 0 && state?.set(`${section.name}: ${v}`)
  }
  const s = useFunState(section.baseModifier)
  useEffect(() => updateDice(s.get()), [section])
  return div(null, [
    section.showLabel && label({ className: styles.label, title: section.tooltip }, [section.name]),
    e(NumberSpinner, { min: section.min, max: section.max, state: s }),
  ])
}
