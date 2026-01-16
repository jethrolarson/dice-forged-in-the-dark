import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  AssistForm: style({
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
  }),
  form: style({
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }),
  hidden: style({
    display: 'none',
  }),
};

globalStyle(`${styles.AssistForm} p`, {
  margin: 0,
  fontSize: '1.17rem',
  fontStyle: 'italic',
});
