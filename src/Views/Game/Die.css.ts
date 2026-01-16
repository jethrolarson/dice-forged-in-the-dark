import { style, keyframes } from '@vanilla-extract/css';

export const pulseAnimation = keyframes({
  '0%': {
    opacity: 0.6,
  },
  '70%': {
    opacity: 0.1,
  },
  '100%': {
    opacity: 0.6,
  },
});

export const styles = {
  Die: style({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 2,
  }),
  dieGlow: style({
    position: 'relative',
    selectors: {
      '&::after': {
        content: "''",
        position: 'absolute',
        zIndex: 0,
        width: '100%',
        height: '100%',
        borderRadius: '5px',
        opacity: 0,
        boxShadow: '0 0 10px 5px var(--die-color)',
        animationDuration: '1s',
        animationIterationCount: 'infinite',
      },
    },
  }),
  dieGlowActive: style({
    selectors: {
      '&::after': {
        opacity: 1,
      },
    },
  }),
  diePulse: style({
    selectors: {
      '&::after': {
        animationName: pulseAnimation,
      },
    },
  }),
};
