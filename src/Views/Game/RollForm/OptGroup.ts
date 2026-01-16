import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import { Component, h, hx } from '@fun-land/fun-web'
import { ButtonSelect } from '../../../components/ButtonSelect'
import { DieColor, DieType } from '../../../Models/Die'
import { BuilderOptionGroup } from '../../../Models/RollConfig'
import { toArray } from '../../../util'
import { flexGrow } from './OptGroup.css'

const DataList: Component<{ id: string; values: string }, HTMLDataListElement> = (signal, { id, values }) =>
  h(
    'datalist',
    { id },
    values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return h('option', { value: val }, [label])
      }),
  )

export const OptGroup: Component<{
  optionGroup: BuilderOptionGroup
  state: FunState<string>
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}> = (signal, { optionGroup: og, state, setDice }) => {
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
  const listId = `list${og.name}`
  const dl = og.rollOptions ? DataList(signal, { id: listId, values: og.rollOptions.join(',') }) : undefined
  return og.fixedOptions && og.rollOptions
    ? ButtonSelect(signal, {
        selected: state.get(),
        options: og.rollOptions,
        columns: og.columns ?? 2,
        label: og.showLabel ? og.name : '',
        tooltip: og.tooltip,
        onSelect: selectOption,
        className: flexGrow,
      })
    : h('label', { title: og.tooltip }, [
        dl,
        hx('input', {
          signal,
          attrs: { list: dl ? listId : '' },
          props: { placeholder: og.name, type: 'text', name: og.name },
          bind: { value: state },
          on: { change: ({ currentTarget: { value } }) => state.set(value) },
        }),
      ])
}
