import React from 'react';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';

/**
 * Map each mot to an icon
 * @param {string} name The name of the mot, ex('bus' or 'train')
 * @returns {Icon} MotIcon
 * @category Utils
 */
const findMotIcon = (name) => {
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

export default findMotIcon;
