import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  TierSelect: style({
    position: 'relative',
  }),
  tierButton: style({
    margin: '0 4px',
    lineHeight: '2rem',
    anchorName: '--tier-anchor',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any),
  popover: style({
    position: 'absolute',
    gap: 5,
    zIndex: 1,
    width: '46px',
    backgroundColor: '#061318',
    padding: 5,
    outline: `1px solid var(--bc-focus)`,
    positionAnchor: '--tier-anchor',
    positionArea: 'center center',
    display: 'none',
    selectors: {
      '&:popover-open': {
        display: 'grid',
      },
    },
  } ),
  option: style({
    display: 'block',
    width: '100%',
  }),
  selected: style({
    backgroundColor: 'var(--bg-die-green) !important',
    borderColor: 'var(--bg-die-green) !important',
    color: '#000',
    cursor: 'default',
  }),
};

globalStyle(`${styles.TierSelect} button`, {
  border: 'none',
  fontSize: '2rem',
  padding: '1px 2px 2px',
  fontSmooth: 'always',
});

globalStyle(`${styles.TierSelect} button:hover`, {
  background: 'transparent',
  textShadow: '1px 1px 3px',
});
