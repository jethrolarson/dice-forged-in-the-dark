import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  AssistForm: style({
    minHeight: 200,
    display: 'grid',
    gap: 12,
    padding: 12,
    margin: 0,
    background: 'var(--bg-game)',
    overflowY: 'auto',
    flex: 1,
  }),
  form: style({
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }),
  poolSelect: style({ display: 'flex', alignItems: 'center' }),
};

globalStyle(`${styles.AssistForm} p`, {
  margin: 0,
  fontSize: '1.17rem',
  fontStyle: 'italic',
});
