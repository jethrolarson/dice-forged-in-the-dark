import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import { DieColor } from '../../../Models/Die';

const textPulse = keyframes({
  from: { textShadow: ' 0 0 6px' },
});

export const styles = {
  popover: style({
    position: 'absolute',
    gap: 5,
    zIndex: 1,
    backgroundColor: '#061318',
    padding: 7,
    outline: `1px solid var(--bc-focus)`,
    positionAnchor: '--factor-anchor',
    positionArea: 'top center',
    display: 'none',
    selectors: {
      '&:popover-open': {
        display: 'grid',
      },
    },
  }),
  FactorSelect: style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }),
  option: style({ display: 'block', width: '100%' }),
  selected: style({
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  }),
  label: style({ flexGrow: 1 }),
  button: style({
    width: 135,
    textAlign: 'center',
  }),
  factorButton: style({
    anchorName: '--factor-anchor',
  }),
  active: style({
    color: DieColor.white,
    fontWeight: 'bold',
    animation: '0.8s infinite alternate',
    animationName: textPulse,
  }),
};
