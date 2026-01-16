import { style } from '@vanilla-extract/css';

export const styles = {
  buttons: style({
    columnCount: 'var(--column-count, 2)',
    columnGap: 5,
  }),
  label: style({
    margin: '0 0 4px',
    fontSize: '1.17rem',
  }),
  option: style({
    display: 'block',
    width: '100%',
    marginBottom: 5,
  }),
  selected: style({
    background: 'var(--bg-button-selected) !important',
    borderColor: 'var(--bc-button-selected) !important',
    color: 'var(--fc-button-selected)',
    cursor: 'default',
  }),
};
