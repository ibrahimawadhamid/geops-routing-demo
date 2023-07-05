import React from 'react';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';

const useStyles = makeStyles(() => ({
  container: {
    background: 'white',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    height: '24px',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 0 5px #555',
    padding: '0 5px',
  },
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div>
        <a href="https://geops.ch/impressum" target="geops">
          <Typography variant="caption">Impressum</Typography>
        </a>
      </div>
      <div>
        <a href="https://geops.ch/" target="geops">
          <Typography variant="caption">geOps</Typography>
        </a>
        <Typography variant="caption"> | </Typography>
        <a href="https://developer.geops.io/" target="geops">
          <Typography variant="caption">Developer Portal</Typography>
        </a>
      </div>
    </div>
  );
}
