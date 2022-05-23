import { index } from '@fun-land/accessor'
import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'
import { hsla } from 'csx'
import { constant } from 'fp-ts/lib/function'
import React, { FC, useEffect, useState } from 'react'
import { stylesheet } from 'typestyle'
import { DieColor, DieType } from '../../../Models/Die'
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
    border: '1px solid var(--border-color)',
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
  sectionRow: {
    display: 'flex',
    gap: 5,
    $nest: {
      '&>*': {
        flexGrow: 1,
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
  const st = useFunState({ values: section.optionGroups.map(constant('')), isOpen: false })
  const { values, isOpen } = st.get()
  const setOpen = st.prop('isOpen').set
  useEffect(() => {
    const dieColor = section.dieColor ?? 'white'
    if (values.every(Boolean)) {
      state.set(values.join(section.separator ?? ' '))
      section.addDieWhenSelected && setDice(section.name, 1, section.addDieWhenSelected as DieType, dieColor)
    } else {
      section.addDieWhenSelected && setDice(section.name, 0, section.addDieWhenSelected as DieType, dieColor)
    }
  }, values)
  return isOpen ? (
    <div key={section.name} className={styles.Builder}>
      {section.optionGroups.map((og, i) => (
        <OptGroup key={og.name} optionGroup={og} state={st.prop('values').focus(index(i))} />
      ))}
      <button onClick={() => setOpen(false)} disabled={!values.every(Boolean)}>
        Done
      </button>
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
    {sections.map((section, i) =>
      section.sectionType === 'builder' ? (
        <Builder key={section.name} state={state.focus(index(section.line))} section={section} setDice={setDice} />
      ) : section.sectionType === 'modifier' ? (
        <Modifier
          key={section.name}
          section={section}
          setDice={setDice}
          state={typeof section.line == 'undefined' ? undefined : state.focus(index(section.line))}
        />
      ) : section.sectionType === 'row' ? (
        <div className={styles.sectionRow} key={'row' + i}>
          <Sections state={state} sections={section.sections} setDice={setDice} />
        </div>
      ) : (
        <Section key={section.name} state={state} section={section} />
      ),
    )}
  </>
)
