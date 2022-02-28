import { index } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import { constant } from 'fp-ts/lib/function'
import React, { FC, useEffect, useState } from 'react'
import { stylesheet } from 'typestyle'
import { borderColor } from '../../../colors'
import { DieColor, DieType } from '../../../Models/GameModel'
import { BuilderSection, RollOptionSection, SectionT } from '../../../Models/RollConfig'
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
  heading: {
    fontWeight: 'normal',
    display: 'block',
    border: 0,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐃ"',
        marginRight: -5,
      },
    },
  },
  expander: {
    borderWidth: 1,
    textAlign: 'left',
    $nest: {
      '&::before': {
        float: 'right',
        content: '"ᐁ"',
      },
    },
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
  setDice: (id: string, count: number, type: DieType, color: keyof typeof DieColor) => void
}> = ({ section, state, setDice }) => {
  const [open, setOpen] = useState(false)
  const st = useFunState(section.optionGroups.map(constant('')))
  const values = st.get()
  useEffect(() => {
    const dieColor = section.dieColor ?? 'white'
    if (values.every(Boolean)) {
      setOpen(false)
      state.set(values.join(section.separator ?? ' '))
      section.addDieWhenSelected && setDice(section.name, 1, section.addDieWhenSelected as DieType, dieColor)
    } else {
      section.addDieWhenSelected && setDice(section.name, 0, section.addDieWhenSelected as DieType, dieColor)
    }
  }, values)
  return open ? (
    <div key={section.name} className={styles.Builder}>
      <button className={styles.heading} onClick={() => setOpen(false)}>
        {section.name}
      </button>
      {section.optionGroups.map((og, i) => (
        <OptGroup key={og.name} optionGroup={og} state={st.focus(index(i))} />
      ))}
    </div>
  ) : (
    <button className={styles.expander} onClick={() => setOpen(true)}>
      {state.get() || section.name}
    </button>
  )
}

export const Sections: FC<{
  state: FunState<string[]>
  sections: RollOptionSection[]
  setDice: (id: string, count: number, type: DieType, color: keyof typeof DieColor) => void
}> = ({ sections, state, setDice }) => (
  <>
    {sections.map((section) =>
      section.sectionType === 'builder' ? (
        <Builder key={section.name} state={state.focus(index(section.line))} section={section} setDice={setDice} />
      ) : section.sectionType === 'modifier' ? (
        <Modifier key={section.name} section={section} setDice={setDice} />
      ) : (
        <Section key={section.name} state={state} section={section} />
      ),
    )}
  </>
)
