import { funState, FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { classes } from '../util'
import { styles } from './ComboBox.css'

export const ComboBox: Component<{
  $: FunState<string>
  data: readonly string[]
  name?: string
  placeholder?: string
  required?: boolean
  className?: string
}> = (signal, { $, data, name, placeholder, required, className }) => {
  const openState = funState(false)
  const filterState = funState('')

  const input = hx('input', {
    props: {
      type: 'text',
      name,
      placeholder,
      className: classes(styles.input, className),
    },
    on: {
      focus: () => openState.set(true),
      blur: () => {
        // Delay to allow click on option
        setTimeout(() => openState.set(false), 200)
      },
      input: ({ currentTarget }) => {
        filterState.set(currentTarget.value)
        $.set(currentTarget.value)
      },
    },
    signal,
  })

  // Create option elements once with stable handlers
  const optionElements = data.map((item) => {
    const option = hx(
      'div',
      {
        props: { className: styles.option },
        signal,
        on: {
          mousedown: (e) => {
            e.preventDefault() // Prevent blur
            $.set(item)
            openState.set(false)
          },
        },
      },
      item,
    )
    return { option, item }
  })

  const dropdown = h(
    'div',
    { className: classes(styles.dropdown, styles.hidden) },
    optionElements.map((el) => el.option),
  )

  // Watch value state and update input
  $.watch(signal, (value) => {
    input.value = value
    // Update required styling
    input.className = classes(styles.input, className, required && value === '' && styles.required)
  })

  // Watch all states to update dropdown visibility and option styling
  const updateDropdown = () => {
    const isOpen = openState.get()
    const filter = filterState.get().toLowerCase()
    const currentValue = $.get()

    // Toggle dropdown visibility
    dropdown.className = classes(styles.dropdown, !isOpen && styles.hidden)

    // Update each option's visibility and selected state
    optionElements.forEach(({ option, item }) => {
      const matches = item.toLowerCase().includes(filter)
      const isSelected = item === currentValue

      // Show/hide based on filter
      option.style.display = matches ? '' : 'none'

      // Update selected styling
      option.className = classes(styles.option, isSelected && styles.selected)
    })
  }

  openState.watch(signal, updateDropdown)
  filterState.watch(signal, updateDropdown)
  $.watch(signal, updateDropdown)

  return h('div', { className: styles.ComboBox }, [input, dropdown])
}
