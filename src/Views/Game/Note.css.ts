import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  Note: style({}),
};

globalStyle(`${styles.Note} img`, {
  maxWidth: '100%',
});

globalStyle(`${styles.Note} ul, ${styles.Note} ol`, {
  margin: '1em 0',
  padding: '0 0 0 1.9em',
});
