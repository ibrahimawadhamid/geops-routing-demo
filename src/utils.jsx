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

export const graphs = {
  rail: [null, 'gen100', 'gen30', 'gen10', 'gen5'],
  bus: [null, 'gen100'],
  tram: [null, 'gen100'],
  subway: [null, 'gen100'],
  gondola: [null, 'gen100', 'gen150'],
  funicular: [null, 'gen100', 'gen150'],
  ferry: [null, 'gen100', 'gen150'],
};

export const getGeneralization = (mot, zoom) => {
  const graph = graphs[mot] || null;
  if (mot === 'rail') {
    if (zoom >= 14) {
      return graph[0];
    }
    if (zoom < 14 && zoom >= 11) {
      return graph[1];
    }
    if (zoom < 11 && zoom >= 9) {
      return graph[2];
    }
    if (zoom < 9 && zoom >= 8) {
      return graph[3];
    }
    return graph[4];
  }

  if (/^(bus|tram|subway)$/.test(mot)) {
    if (zoom >= 14) {
      return graph[0];
    }
    return graph[1];
  }

  if (/^(gondola|funicular|ferry)$/.test(mot)) {
    if (zoom >= 15) {
      return graph[0];
    }
    if (zoom > 13 && zoom <= 15) {
      return graph[1];
    }
    return graph[2];
  }

  return null;
};
