import { style } from '@vanilla-extract/css';

export const styles = {
  ComboBox: style({
    position: 'relative',
  }),
  input: style({
    width: '100%',
  }),
  required: style({
    borderColor: 'red !important',
  }),
  dropdown: style({
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    overflowY: 'auto',
    backgroundColor: '#061318',
    border: '1px solid var(--border-color)',
    zIndex: 1000,
    marginBottom: 2,
  }),
  option: style({
    padding: '8px 12px',
    cursor: 'pointer',
    selectors: {
      '&:hover': {
        backgroundColor: 'var(--bg-button-hover)',
      },
    },
  }),
  selected: style({
    backgroundColor: 'var(--bg-button-selected)',
    color: 'var(--fc-button-selected)',
  }),
  hidden: style({
    display: 'none',
  }),
};
