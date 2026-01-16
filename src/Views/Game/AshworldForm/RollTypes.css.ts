import { style } from '@vanilla-extract/css';

export const styles = {
  rollTypes: style({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gridGap: 10,
    margin: 10,
  }),
  active: style({
    background: 'var(--bg-button-selected)',
    color: 'var(--fc-button-selected)',
    borderColor: 'var(--bc-button-selected)',
    borderBottomColor: 'var(--bc-button) !important',
  }),
  tab: style({
    borderWidth: '0 0 2px',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: 'var(--fc)',
    fontWeight: 'bold',
  }),
};
