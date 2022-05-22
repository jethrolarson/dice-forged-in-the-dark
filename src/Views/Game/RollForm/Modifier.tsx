import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { tap } from 'ramda'
import React, { FC, useEffect } from 'react'
import { stylesheet } from 'typestyle'
import { NumberSpinner } from '../../../components/NumberSpinner'
import { DieType, DieColor } from '../../../Models/Die'
import { ModifierT } from '../../../Models/RollConfig'

const styles = stylesheet({
  label: {
    margin: '0 0 4px',
    fontSize: 14,
  },
})
export const Modifier: FC<{
  section: ModifierT
  setDice: (id: string, count: number, type: DieType, color: keyof typeof DieColor) => void
  state?: FunState<string>
}> = ({ setDice, section, state }) => {
  const updateDice = (v: number) => {
    setDice(section.name, v, section.dieType, section.dieColor)
    v !== 0 && state?.set(`${section.name}: ${v}`)
  }
  const s = useFunState(section.baseModifier, tap(updateDice))
  useEffect(() => updateDice(s.get()), [section])
  return (
    <div>
      {section.showLabel && (
        <label className={styles.label} title={section.tooltip}>
          {section.name}
        </label>
      )}
      <NumberSpinner min={section.min} max={section.max} state={s} />
    </div>
  )
}
