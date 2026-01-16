import { style } from '@vanilla-extract/css';
import { hsla } from 'csx';

export const styles = {
  Builder: style({
    display: 'grid',
    gap: 10,
    border: '1px solid var(--border-color)',
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  }),
  expander: style({
    borderWidth: 1,
    textAlign: 'left',
    selectors: {
      '&::before': {
        float: 'right',
        content: '"ᐁ"',
      },
    },
  }),
  footer: style({
    marginTop: 10,
    display: 'grid',
    gap: 5,
    gridTemplateColumns: '1fr 1fr',
  }),
  hidden: style({
    display: 'none',
  }),
};
