import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  GameSettings: style({
    background: 'var(--bg-game)',
    color: 'var(--fc)',
    padding: '10px 34px 34px',
    flex: 1,
    display: 'grid',
    gridGap: 10,
    alignContent: 'start',
  }),
  heading: style({
    display: 'flex',
    alignItems: 'center',
  }),
  loadPreset: style({
    display: 'inline-block',
    width: 'auto',
    marginBottom: 2,
  }),
  rollConfigLabel: style({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  rollConfig: style({
    height: 600,
  }),
  error: style({ color: 'red' }),
  leftButtons: style({ display: 'flex', gap: 10 }),
  footer: style({ display: 'flex', justifyContent: 'space-between' }),
};

globalStyle(`${styles.heading} h1`, {
  margin: 0,
  marginLeft: 4,
  fontWeight: 'normal',
});

globalStyle(`${styles.rollConfigLabel} button`, {
  marginLeft: 5,
});
