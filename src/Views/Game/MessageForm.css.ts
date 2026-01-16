import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  MessageForm: style({
    display: 'grid',
    gridGap: 10,
    margin: 10,
  }),
  textarea: style({
    width: '100%',
    height: 44,
    display: 'block',
    maxHeight: 200,
    resize: 'vertical',
  }),
};

globalStyle(`${styles.MessageForm} p`, {
  margin: 0,
  fontSize: '1.17rem',
  fontStyle: 'italic',
});
