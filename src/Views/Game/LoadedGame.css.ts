import { style, globalStyle } from '@vanilla-extract/css'

export const body = style({
  display: 'flex',
  flexGrow: 1,
})
export const left = style({
  flexGrow: 1,
})
export const right = style({
  display: 'flex',
  borderLeft: 'var(--border-game)',
  flexGrow: 1,
  flexDirection: 'column',
  height: '100vh',
  maxWidth: 400,
  background: 'var(--bg-game)',
  backgroundRepeat: 'no-repeat',
  color: 'var(--fc)',
})
export const heading = style({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-color)',
})
export const title = style({
  background: 'transparent',
  verticalAlign: 'bottom',
  fontSize: '2.2rem',
  margin: 0,
  appearance: 'none',
  border: '2px solid transparent',
  padding: '5px',
  flexGrow: 1,
  selectors: {
    '&:focus': {
      borderColor: '#fff',
      outline: 'none',
    },
  },
})
export const title_small = style({
  fontSize: '1.5rem',
})
export const settingsButton = style({
  border: 'none',
  padding: 10,
  background: 'transparent',
  textDecoration: 'none',
  color: 'var(--c-icon-button) !important',
  transition: 'color 0.2s',
  selectors: {
    '&:hover': {
      color: 'var(--c-icon-button-hover) !important',
      transition: 'color 0.2s',
    },
  },
})
export const log = style({
  borderBottom: '1px solid var(--border-color)',
  borderWidth: '1px 0',
  flex: 1,
  flexDirection: 'column',
  display: 'flex',
  overflowY: 'scroll',
})
export const rolls = style({
  marginTop: 'auto',
  listStyle: 'none',
  margin: 0,
  padding: 0,
})
export const tabs = style({
  display: 'flex',
})
export const tabOn = style({
  borderColor: 'var(--border-color)',
})
export const canvas = style({
  width: '100%',
  height: '100vh',
  display: 'block',
})
export const showDiceCol = style({
  display: 'flex',
  minWidth: 15,
  background: 'var(--bg-scrollbar)',
})
export const showDiceApp = style({
  writingMode: 'vertical-rl',
})
export const minimize = style({
  marginRight: 5,
  textDecoration: 'none !important',
})

globalStyle(`${tabs} > *`, {
  flex: '1 0',
  borderColor: 'transparent',
  borderWidth: '2px 0 0 ',
  background: 'transparent !important',
  color: 'var(--border-color) !important',
})

globalStyle(`${showDiceCol}:hover span`, {
  display: 'block',
})
