import { style, globalStyle } from '@vanilla-extract/css';

const circleSize = 120;

export const styles = {
  RollLog: style({
    listStyle: 'none',
    display: 'flex',
    margin: '18px 12px',
    fontSize: '1rem',
  }),
  metaWrap: style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
  }),
  meta: style({
    border: `solid var(--border-color)`,
    borderWidth: '1px 1px 1px 0',
    minHeight: circleSize,
    borderRadius: '0 var(--br) var(--br) 0',
    padding: '4px 8px 8px',
    marginTop: 6,
    background: 'var(--bg-log-meta)',
  }),
  time: style({
    textAlign: 'right',
    color: 'var(--fc-deem)',
    fontSize: '0.9rem',
    display: 'block',
    margin: '4px 16px 0',
  }),
  name: style({
    marginTop: 6,
    lineHeight: 1,
  }),
  dice: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    background: 'var(--bg-dice)',
    flexWrap: 'wrap',
    flexGrow: 1,
    padding: 10,
    borderRadius: 'calc(var(--br) - 2px) calc(var(--br) - 2px) 0 0',
  }),
  line: style({ fontWeight: 500 }),
  rollType: style({
    fontSize: '1.7rem',
    fontFamily: 'var(--ff-heading)',
  }),
  smallRollType: style({
    fontSize: '1.17rem',
  }),
  result: style({
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: `2px solid var(--border-color)`,
    borderRadius: 'var(--br)',
    width: circleSize,
    minHeight: circleSize,
    marginBottom: 4,
  }),
  resultLabel: style({
    textAlign: 'center',
    display: 'inline-block',
    color: 'hsl(200, 60%, 8%)',
    textTransform: 'uppercase',
    padding: '4px 8px',
    lineHeight: '1',
    borderRadius: '0 0 var(--br) var(--br)',
    margin: '0 -2px -2px',
    fontSize: '1.5rem',
  }),
  note: style({
    marginTop: 2,
    fontStyle: 'italic',
  }),
  // Dynamic result styles - these will be applied via inline styles
  resultCrit: style({
    background: 'var(--bg-result-crit)',
    boxShadow: 'var(--bs-result-crit)',
  }),
  resultSuccess: style({
    background: 'var(--bg-result-success)',
    boxShadow: 'var(--bs-result-success)',
  }),
  resultMixed: style({
    background: 'var(--bg-result-mixed)',
    boxShadow: 'var(--bs-result-mixed)',
  }),
  resultMiss: style({
    background: 'var(--bg-result-miss)',
    color: '#fff',
    boxShadow: 'var(--bs-result-miss)',
  }),
  resultCritFail: style({
    background: 'var(--bg-result-critfail)',
    color: '#fff',
    boxShadow: 'var(--bs-result-critfail)',
  }),
};

globalStyle(`${styles.dice} > *`, {
  margin: 3,
});

globalStyle(`${styles.note} img`, {
  maxWidth: '100%',
});
