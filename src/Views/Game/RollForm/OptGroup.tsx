import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import React, { FC } from 'react'
import { style } from 'typestyle'
import { ButtonSelect } from '../../../components/ButtonSelect'
import { TextInput } from '../../../components/TextInput'
import { BuilderOptionGroup } from '../../../Models/RollConfig'

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

export const OptGroup: FC<{ optionGroup: BuilderOptionGroup; state: FunState<string> }> = ({
  optionGroup: og,
  state,
}) =>
  og.fixedOptions && og.rollOptions ? (
    <ButtonSelect
      state={state}
      options={og.rollOptions}
      columns={og.columns ?? 2}
      label={og.showLabel ? og.name : ''}
      tooltip={og.tooltip}
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
