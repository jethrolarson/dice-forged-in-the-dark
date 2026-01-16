import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  ActionForm: style({
    minHeight: 200,
    display: 'grid',
    gap: 12,
    padding: 12,
    margin: 0,
    overflowY: 'auto',
    background: 'var(--bg-game)',
    flex: 1,
  }),
  form: style({
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }),
};

globalStyle(`${styles.ActionForm} p`, {
  margin: 0,
  fontSize: '1.17rem',
  fontStyle: 'italic',
});
