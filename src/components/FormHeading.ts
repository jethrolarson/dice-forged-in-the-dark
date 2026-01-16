import { Component, h } from '@fun-land/fun-web'

export const FormHeading: Component<{ title: string }> = (_signal, { title }) => h('h3', null, [title])
