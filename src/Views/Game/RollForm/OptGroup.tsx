import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import React, { FC } from 'react'
import { style } from 'typestyle'
import { ButtonSelect } from '../../../components/ButtonSelect'
import { TextInput } from '../../../components/TextInput'
import { DieColor, DieType } from '../../../Models/Die'
import { BuilderOptionGroup } from '../../../Models/RollConfig'
import { toArray } from '../../../util'

const DataList: FC<{ id: string; values: string }> = ({ id, values }) => (
  <datalist id={id}>
    {values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return <option key={v} value={val} children={label} />
      })}
  </datalist>
)

export const OptGroup: FC<{
  optionGroup: BuilderOptionGroup
  state: FunState<string>
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = ({ optionGroup: og, state, setDice }) => {
  const selectOption = (name: string) => {
    const opt = og.rollOptions?.find((o) => name === (typeof o === 'string' ? o : o.name))
    if (opt) {
      const isComplex = typeof opt !== 'string'
      state.mod((st) => {
        isComplex &&
          opt?.addDieWhenSelected &&
          setDice(og.name, st === name ? [] : toArray(opt.addDieWhenSelected), 'purple')
        return st === name ? '' : name
      })
    }
  }
  return og.fixedOptions && og.rollOptions ? (
    <ButtonSelect
      selected={state.get()}
      options={og.rollOptions}
      columns={og.columns ?? 2}
      label={og.showLabel ? og.name : ''}
      tooltip={og.tooltip}
      onSelect={selectOption}
      className={style({ flexGrow: 1 })}
    />
  ) : (
    <label title={og.tooltip}>
      <TextInput
        passThroughProps={{
          placeholder: og.name,
          type: 'text',
          name: og.name,
          list: `list${og.name}`,
        }}
        state={state}
      />
      {og.rollOptions && <DataList id={`list${og.name}`} values={og.rollOptions.join(',')} />}
    </label>
  )
}
