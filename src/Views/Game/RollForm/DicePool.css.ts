import { style } from '@vanilla-extract/css';

export const styles = {
  dieButton: style({
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: 'transparent !important',
    border: 'none',
  }),
  DicePool: style({
    border: '2px solid var(--border-color)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  }),
  diceBox: style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dice)',
    flexGrow: 1,
    gap: 10,
  }),
  rollButton: style({
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
  }),
};
