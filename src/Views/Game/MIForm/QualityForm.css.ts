import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  QualityForm: style({
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
  }),
  form: style({
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }),
  hidden: style({
    display: 'none',
  }),
};

globalStyle(`${styles.QualityForm} p`, {
  margin: 0,
  fontSize: '1rem',
  fontStyle: 'italic',
});
