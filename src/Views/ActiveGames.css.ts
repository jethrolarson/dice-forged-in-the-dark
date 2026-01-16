import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  actions: style({
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 30,
  }),
  list: style({
    listStyle: 'none',
    padding: 0,
  }),
};

globalStyle(`${styles.list} li`, {
  margin: '4px 0',
});
