import { style, keyframes, globalStyle } from '@vanilla-extract/css';

const textPulse = keyframes({
  from: {
    textShadow: ' 0 0 6px',
  },
});

export const styles = {
  popover: style({
    position: 'absolute',
    width: 135,
    gap: 5,
    zIndex: 2,
    backgroundColor: '#061318',
    padding: 7,
    outline: `1px solid var(--bc-focus)`,
    positionAnchor: '--approach-anchor',
    positionArea: 'top center',
    display: 'none',
    selectors: {
      '&:popover-open': {
        display: 'grid',
      },
    },
  }),
  active: style({
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  }),
  Approach: style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }),
  option: style({
    display: 'block',
    borderWidth: 0,
    width: '100%',
  }),
  selected: style({
    backgroundColor: 'var(--bg-button-selected) !important',
    borderColor: 'var(--bc-button-selected) !important',
    color: 'var(--fc-button-selected) !important',
  }),
  approachButton: style({
    width: 135,
    anchorName: '--approach-anchor',
  }),
  required: style({
    borderColor: 'red !important',
  }),
};

globalStyle(`${styles.Approach} label`, {
  flexGrow: 1,
});
