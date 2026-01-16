import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  form: style({
    padding: 10,
  }),
  formWrap: style({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 10,
  }),
  formGrid: style({
    display: 'grid',
    gridGap: 10,
    flexGrow: 2,
  }),
  backButton: style({
    border: 0,
    padding: '4px',
    marginRight: 4,
  }),
  backButtonIcon: style({}),
  heading: style({}),
  rollTypes: style({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: 10,
  }),
  note: style({}),
  noteInput: style({
    width: '100%',
    height: 28,
    display: 'block',
    maxHeight: 200,
    resize: 'none',
  }),
  dieButton: style({
    cursor: 'pointer',
    appearance: 'none',
    opacity: 1,
    padding: 0,
    backgroundColor: 'transparent !important',
    border: 'none',
  }),
  diceButtons: style({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  character: style({}),
  rollButton: style({
    fontWeight: 'bold',
    borderWidth: '2px 0 0',
    borderRadius: '0 0 5px 5px',
  }),
};

globalStyle(`${styles.backButtonIcon} svg`, {
  margin: '-2px 2px 0 0',
});
