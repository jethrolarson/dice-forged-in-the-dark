import { index } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import { constant } from 'fp-ts/lib/function'
import React, { FC, useEffect, useState } from 'react'
import { stylesheet } from 'typestyle'
import { borderColor } from '../../../colors'
import { DieColor, DieType } from '../../../Models/GameModel'
import { BuilderSection, RollOptionGroup, RollOptionSection, SectionT } from '../../../Models/RollConfig'
import { Modifier } from './Modifier'
import { OptGroup } from './OptGroup'

const styles = stylesheet({
  Section: {
    display: 'flex',
    gap: 10,
  },
  Builder: {
    display: 'grid',
    gap: 10,
    border: '1px solid ' + borderColor,
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  },
})

const Section: FC<{ state: FunState<string[]>; section: SectionT }> = ({ section, state }) => (
  <div key={section.name} className={styles.Section}>
    {section.optionGroups.map((og) => (
      <OptGroup key={og.name} optionGroup={og} state={state.focus(index(og.line))} />
    ))}
  </div>
)

const Builder: FC<{
  state: FunState<string>
  section: BuilderSection
  addDie: (type: DieType, color: keyof typeof DieColor) => void
}> = ({ section, state, addDie }) => {
  const [open, setOpen] = useState(false)
  const st = useFunState(section.optionGroups.map(constant('')))
  const values = st.get()
  useEffect(() => {
    if (values.every(Boolean)) {
      setOpen(false)
      state.set(values.join(section.separator ?? ' '))
      const dieColor = section.dieColor ?? 'white'
      section.addDieWhenSelected && addDie(section.addDieWhenSelected as DieType, dieColor)
    }
  }, values)
  return open ? (
    <div key={section.name} className={styles.Builder}>
      <h4>{section.name}</h4>
      {section.optionGroups.map((og, i) => (
        <OptGroup key={og.name} optionGroup={og} state={st.focus(index(i))} />
      ))}
    </div>
  ) : (
    <button onClick={() => setOpen(true)}>{state.get() || section.name}</button>
  )
}

export const Sections: FC<{
  state: FunState<string[]>
  sections: RollOptionSection[]
  addDie: (type: DieType, color: keyof typeof DieColor) => void
  setDice: (id: string, count: number, type: DieType, color: keyof typeof DieColor) => void
}> = ({ sections, state, addDie, setDice }) => (
  <>
    {sections.map((section) =>
      section.sectionType === 'builder' ? (
        <Builder key={section.name} state={state.focus(index(section.line))} section={section} addDie={addDie} />
      ) : section.sectionType === 'modifier' ? (
        <Modifier key={section.name} section={section} setDice={setDice} />
      ) : (
        <Section key={section.name} state={state} section={section} />
      ),
    )}
  </>
)
