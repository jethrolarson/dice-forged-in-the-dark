import { style, globalStyle } from '@vanilla-extract/css';
import { hsla } from 'csx';

export const styles = {
  Section: style({
    display: 'flex',
    gap: 10,
  }),
  Builder: style({
    display: 'grid',
    gap: 10,
    border: '1px solid var(--border-color)',
    backgroundColor: hsla(0, 0, 0, 0.3).toString(),
    padding: 5,
  }),
  heading: style({
    fontWeight: 'normal',
    display: 'block',
    border: 0,
    textAlign: 'left',
    selectors: {
      '&::before': {
        float: 'right',
        content: '"ᐃ"',
        marginRight: -5,
      },
    },
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
  sectionRow: style({
    display: 'flex',
    gap: 5,
  }),
  hidden: style({
    display: 'none',
  }),
};

globalStyle(`${styles.sectionRow} > *`, {
  flexGrow: 1,
});
