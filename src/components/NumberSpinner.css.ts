import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  NumberSpinner: style({
    display: 'flex',
  }),
};

globalStyle(`${styles.NumberSpinner} label`, {
  border: 'solid var(--border-color)',
  borderWidth: '2px 0',
  padding: '3px 8px',
});

globalStyle(`${styles.NumberSpinner} button`, {
  fontSize: '1.17rem',
  padding: '3px 8px',
});
