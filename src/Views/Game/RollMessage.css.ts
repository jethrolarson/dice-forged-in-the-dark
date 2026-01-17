import { style } from '@vanilla-extract/css';

export const messageStyle = style({
  fontSize: '1rem',
  margin: '24px 12px',
  border: `1px solid var(--border-color)`,
  borderRadius: '8px',
  padding: '8px 10px',
  position: 'relative',
  paddingRight: '42px',
});

export const redactedMessageStyle = style({
  border: `1px dashed var(--border-color)`,
  borderRadius: 'var(--br)',
  color: 'var(--fc-deem)',
  fontStyle: 'italic',
  opacity: 0.8,
  padding: '6px 10px',
});
