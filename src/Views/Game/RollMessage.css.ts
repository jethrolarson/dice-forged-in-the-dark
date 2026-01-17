import { style } from '@vanilla-extract/css';

export const messageStyle = style({
  fontSize: '1rem',
  margin: '24px 12px 0',
  border: `1px solid var(--border-color)`,
  borderRadius: 'var(--br)',
  padding: '8px 12px',
  position: 'relative',
  paddingRight: '42px',
});

export const messageWrap = style({
  display: 'flex',
  flexDirection: 'column',
});

export const redactedMessageStyle = style({
  border: `1px dashed var(--border-color)`,
  borderRadius: 'var(--br)',
  color: 'var(--fc-deem)',
  fontStyle: 'italic',
  opacity: 0.8,
  padding: '6px 10px',
  paddingRight: '42px',
});
