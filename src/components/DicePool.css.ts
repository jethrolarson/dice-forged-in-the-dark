import { style, keyframes } from '@vanilla-extract/css';

const spin = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

export const styles = {
  dieButton: style({
    cursor: 'grab',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    background: 'transparent',
    backgroundColor: 'transparent !important',
    border: 'none',
    animationName: spin,
    animationDuration: '1500ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    selectors: {
      '&:hover': {
        animationDuration: '5000ms',
      },
    },
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
    alignContent: 'center',
    justifyContent: 'center',
    background: 'var(--bg-dice)',
    flexGrow: 1,
    gap: 20,
    minHeight: 400,
    userSelect: 'none',
  }),
  rollButton: style({
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
    background: 'var(--bg-button-selected)',
  }),
  roundTop: style({
    borderRadius: '6px 6px 0 0',
  }),
  diceSelection: style({
    display: 'grid',
    padding: 4,
    borderBottom: '2px solid #554889',
  }),
};
