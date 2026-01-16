import { style } from '@vanilla-extract/css';

export const styles = {
  dieButton: style({
    cursor: 'pointer',
    appearance: 'none',
    opacity: 0.6,
    padding: 0,
    backgroundColor: 'transparent !important',
    border: 'none',
    selectors: {
      '&:hover': {
        opacity: 1,
      },
    },
  }),
  diceButtons: style({
    justifySelf: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
  }),
};
