import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    position: 'absolute',
    bottom: 0,
    fontSize: '0.8em',
    display: 'flex',
    justifyContent: 'space-between',
    height: '24px',
    alignItems: 'center',
    width: '100%',
    boxShadow: '0 0 5px #555',
    '& div': {
      margin: '0 10px',
      '& a': {
        color: '#555',
        textDecoration: 'none',
      },
    },
  },
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div>
        <a href="https://geops.ch/impressum" target="geops">
          Impressum
        </a>
      </div>
      <div>
        <a href="https://geops.ch/" target="geops">
          geOps
        </a>{' '}
        |{' '}
        <a href="https://developer.geops.io/" target="geops">
          Developer Portal
        </a>
      </div>
    </div>
  );
}
