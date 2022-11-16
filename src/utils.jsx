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
export const findMotIcon = (name) => {
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

export const to4326 = (coord, decimal = 5) => {
  return transform(coord, 'EPSG:3857', 'EPSG:4326').map((c) =>
    c.toFixed(decimal),
  );
};

export const to3857 = (coord) => {
  return transform(coord, 'EPSG:4326', 'EPSG:3857');
};

export const getGeneralization = (mot, zoom) => {
  if (mot === 'rail') {
    if (zoom >= 14) {
      return null;
    }
    if (zoom < 14 && zoom >= 11) {
      return 'gen100';
    }
    if (zoom < 11 && zoom >= 9) {
      return 'gen30';
    }
    if (zoom < 9 && zoom >= 8) {
      return 'gen10';
    }
    return 'gen5';
  }

  if (/^(bus|tram|subway)$/.test(mot)) {
    if (zoom >= 14) {
      return null;
    }
    return 'gen100';
  }

  if (/^(gondola|funicular|ferry)$/.test(mot)) {
    if (zoom >= 15) {
      return null;
    }
    if (zoom > 13 && zoom <= 15) {
      return 'gen150';
    }
    return 'gen100';
  }

  return null;
};
