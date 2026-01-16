import { style, keyframes, globalStyle } from '@vanilla-extract/css';

const textPulse = keyframes({
  from: {
    textShadow: ' 0 0 6px',
  },
});

export const styles = {
  Power: style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }),
  selected: style({
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  }),
  active: style({
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  }),
  input: style({
    width: 135,
  }),
};

globalStyle(`${styles.Power} label`, {
  flexGrow: 1,
});

globalStyle(`${styles.input}&&`, {
  textAlign: 'center',
});
