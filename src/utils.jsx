import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import React from 'react';
import { transform } from 'ol/proj';

/**
 * Map each mot to an icon
 * @param {string} name The name of the mot, ex('bus' or 'train')
 * @returns {Icon} MotIcon
 * @category Utils
 */
export const findMotIcon = name => {
  let result = null;
  const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
  switch (name) {
    case 'rail':
      result = <DirectionsRailwayIcon />;
      break;
    case 'foot':
      result = <DirectionsWalkIcon />;
      break;
    default:
      result = <DirectionsBusIcon />;
      break;
  }
  return <span title={capitalName}>{result}</span>;
};

export const to4326 = (coord, decimal = 4) => {
  return transform(coord, 'EPSG:3857', 'EPSG:4326').map(c =>
    c.toFixed(decimal),
  );
};

export const to3857 = coord => {
  return transform(coord, 'EPSG:4326', 'EPSG:3857');
};
