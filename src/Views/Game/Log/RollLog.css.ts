import { style, globalStyle } from '@vanilla-extract/css'

const circleSize = 120

export const RollLog = style({
  listStyle: 'none',
  display: 'flex',
  margin: '0 12px',
  fontSize: '1rem',
})

export const metaWrap = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flexGrow: 1,
})

export const meta = style({
  border: `solid var(--border-color)`,
  borderWidth: '1px 1px 1px 0',
  minHeight: circleSize,
  borderRadius: '0 var(--br) var(--br) 0',
  padding: '4px 8px 8px',
  paddingRight: '40px',
  marginTop: 6,
  background: 'var(--bg-log-meta)',
  position: 'relative',
})

export const time = style({
  textAlign: 'right',
  color: 'var(--fc-deem)',
  fontSize: '0.9rem',
  display: 'block',
  margin: '4px 16px 0',
})
export const name = style({
  marginTop: 6,
  lineHeight: 1,
})
export const dice = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignContent: 'center',
  background: 'var(--bg-dice)',
  flexWrap: 'wrap',
  flexGrow: 1,
  padding: 10,
  borderRadius: 'calc(var(--br) - 2px) calc(var(--br) - 2px) 0 0',
})
export const line = style({ fontWeight: 500 })
export const rollType = style({
  fontSize: '1.7rem',
  fontFamily: 'var(--ff-heading)',
})
export const smallRollType = style({ fontSize: '1.17rem' })
export const result = style({
  display: 'flex',
  flexShrink: 0,
  flexDirection: 'column',
  justifyContent: 'space-between',
  border: `2px solid var(--border-color)`,
  borderRadius: 'var(--br)',
  width: circleSize,
  minHeight: circleSize,
  marginBottom: 4,
})
export const resultLabel = style({
  textAlign: 'center',
  display: 'inline-block',
  color: 'hsl(200, 60%, 8%)',
  textTransform: 'uppercase',
  padding: '4px 8px',
  lineHeight: '1',
  borderRadius: '0 0 var(--br) var(--br)',
  margin: '0 -2px -2px',
  fontSize: '1.5rem',
})
export const note = style({
  marginTop: 2,
  fontStyle: 'italic',
})
// Dynamic result styles - these will be applied via inline styles
export const resultCrit = style({
  background: 'var(--bg-result-crit)',
  boxShadow: 'var(--bs-result-crit)',
})
export const resultSuccess = style({
  background: 'var(--bg-result-success)',
  boxShadow: 'var(--bs-result-success)',
})
export const resultMixed = style({
  background: 'var(--bg-result-mixed)',
  boxShadow: 'var(--bs-result-mixed)',
})
export const resultMiss = style({
  background: 'var(--bg-result-miss)',
  color: '#fff',
  boxShadow: 'var(--bs-result-miss)',
})
export const resultCritFail = style({
  background: 'var(--bg-result-critfail)',
  color: '#fff',
  boxShadow: 'var(--bs-result-critfail)',
})
export const redactionButton = style({
  position: 'absolute',
  top: '2px',
  right: '2px',
  fontSize: '1.2rem',
  width: '24px',
  height: '24px',
  textAlign: 'center',
  padding: 0,
  cursor: 'pointer',
  border: '1px solid transparent',
  borderRadius: '6px',
  color: 'var(--fc-deem)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none !important',
  transition: 'opacity 0.2s, background-color 0.2s, border-color 0.2s',
  zIndex: 10,
  selectors: {
    '&:hover': {
      opacity: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      borderColor: 'var(--fc-deem)',
      cursor: 'pointer !important',
    },
  },
})
export const redactedPlaceholder = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  paddingRight: '42px',
  border: '1px dashed var(--border-color)',
  borderRadius: 'var(--br)',
  color: 'var(--fc-deem)',
  fontStyle: 'italic',
  flexGrow: 1,
  opacity: 0.8,
})

globalStyle(`${dice} > *`, {
  margin: 3,
})

globalStyle(`${note} img`, {
  maxWidth: '100%',
})
