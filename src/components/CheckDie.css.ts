import { style } from '@vanilla-extract/css';

export const styles = {
  CheckDie: style({
    fontSize: '1rem',
  }),
  checkbox: style({
    verticalAlign: 'middle',
    appearance: 'none',
    width: '1.2em',
    height: '1.2em',
    marginRight: 5,
    borderWidth: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Roboto Mono'",
    selectors: {
      '&:checked:before': {
        content: '"×"',
        fontSize: '1.3em',
        lineHeight: 1,
      },
    },
  }),
};
