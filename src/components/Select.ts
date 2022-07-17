import { FunState } from '@fun-land/fun-state'
import { h } from '../util'

export const Select = ({ $, options }: { options: readonly string[]; $: FunState<string> }) => {
  const v = $.get()
  return h('select', { onChange: ({ currentTarget: { value } }) => $.set(value) }, [
    options.map((op) => h('option', { selected: op === v, key: op }, [op])),
  ])
}
