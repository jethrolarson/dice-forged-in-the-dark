import { FunState } from '@fun-land/fun-state'

export const Select = ({ $, options }: { options: readonly string[]; $: FunState<string> }) => {
  const value = $.get()
  return (
    <select onChange={({ currentTarget: { value } }) => $.set(value)}>
      {options.map((op) => (
        <option value={op} selected={op === value}>
          {op}
        </option>
      ))}
    </select>
  )
}
