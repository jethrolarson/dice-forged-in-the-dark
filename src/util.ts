import { createElement } from 'react'

export const toArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x])

export const h = <N extends keyof React.ReactHTML>(
  type: N,
  props?: JSX.IntrinsicElements[N] | null,
  ...children: React.ReactNode[]
) => createElement(type, props, children)

const h_ =
  <N extends keyof React.ReactHTML>(type: N) =>
  (props?: JSX.IntrinsicElements[N] | null, ...children: React.ReactNode[]) =>
    createElement(type, props, children)

export const e = createElement

export const div = h_('div')
export const button = h_('button')
export const label = h_('label')
export const h1 = h_('h1')
export const p = h_('p')
