import { style, globalStyle } from '@vanilla-extract/css';

export const styles = {
  Game: style({}),
  body: style({
    display: 'flex',
  }),
  left: style({
    flexGrow: 1,
  }),
  right: style({
    display: 'flex',
    borderLeft: 'var(--border-game)',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 400,
    background: 'var(--bg-game)',
    backgroundRepeat: 'no-repeat',
    color: 'var(--fc)',
  }),
  heading: style({
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
  }),
  title: style({
    background: 'transparent',
    verticalAlign: 'bottom',
    fontSize: '2.2rem',
    margin: 0,
    appearance: 'none',
    border: '2px solid transparent',
    padding: '5px',
    flexGrow: 1,
    selectors: {
      '&:focus': {
        borderColor: '#fff',
        outline: 'none',
      },
    },
  }),
  title_small: style({
    fontSize: '1.5rem',
  }),
  settingsButton: style({
    border: 'none',
    padding: 10,
    background: 'transparent',
    textDecoration: 'none',
    color: 'var(--c-icon-button) !important',
    transition: 'color 0.2s',
    selectors: {
      '&:hover': {
        color: 'var(--c-icon-button-hover) !important',
        transition: 'color 0.2s',
      },
    },
  }),
  log: style({
    borderBottom: '1px solid var(--border-color)',
    borderWidth: '1px 0',
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    overflowY: 'scroll',
  }),
  rolls: style({
    marginTop: 'auto',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  }),
  tabs: style({
    display: 'flex',
  }),
  tabOn: style({
    borderColor: 'var(--border-color)',
  }),
  canvas: style({
    width: '100%',
    height: '100vh',
    display: 'block',
  }),
  showDiceCol: style({
    display: 'flex',
    minWidth: 15,
    background: 'var(--bg-scrollbar)',
  }),
  showDiceApp: style({
    writingMode: 'vertical-rl',
  }),
  minimize: style({
    marginRight: 5,
    textDecoration: 'none !important',
  }),
};

globalStyle(`${styles.tabs} > *`, {
  flex: '1 0',
  borderColor: 'transparent',
  borderWidth: '2px 0 0 ',
  background: 'transparent !important',
  color: 'var(--border-color) !important',
});

globalStyle(`${styles.showDiceCol}:hover span`, {
  display: 'block',
});
