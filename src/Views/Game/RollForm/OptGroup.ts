import { FunState } from '@fun-land/fun-state'
import { trim } from 'fp-ts/lib/string'
import { style } from 'typestyle'
import { ButtonSelect } from '../../../components/ButtonSelect'
import { TextInput } from '../../../components/TextInput'
import { DieColor, DieType } from '../../../Models/Die'
import { BuilderOptionGroup } from '../../../Models/RollConfig'
import { e, h, label, toArray } from '../../../util'

const DataList = ({ id, values }: { id: string; values: string }) =>
  h(
    'datalist',
    { id },
    values
      .split(',')
      .map(trim)
      .map((v) => {
        const [val, label] = v.split('|')
        return h('option', { key: v, value: val, children: label })
      }),
  )

export const OptGroup = ({
  optionGroup: og,
  state,
  setDice,
}: {
  optionGroup: BuilderOptionGroup
  state: FunState<string>
  setDice: (id: string, type: DieType[], color: keyof typeof DieColor) => void
}) => {
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
  return og.fixedOptions && og.rollOptions
    ? e(ButtonSelect, {
        selected: state.get(),
        options: og.rollOptions,
        columns: og.columns ?? 2,
        label: og.showLabel ? og.name : '',
        tooltip: og.tooltip,
        onSelect: selectOption,
        className: style({ flexGrow: 1 }),
      })
    : label({ title: og.tooltip }, [
        e(TextInput, {
          passThroughProps: {
            placeholder: og.name,
            type: 'text',
            name: og.name,
            list: `list${og.name}`,
          },
          state,
        }),
        og.rollOptions && e(DataList, { id: `list${og.name}`, values: og.rollOptions.join(',') }),
      ])
}
