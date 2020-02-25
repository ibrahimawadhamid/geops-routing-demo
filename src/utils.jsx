import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import RowingIcon from '@material-ui/icons/Rowing';
import TramIcon from '@material-ui/icons/Tram';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsSubwayIcon from '@material-ui/icons/DirectionsSubway';
import CallMergeIcon from '@material-ui/icons/CallMerge';
import SubwayIcon from '@material-ui/icons/Subway';
import React from 'react';

/**
 * Map each mot to an icon
 * @param {string} name The name of the mot, ex('bus' or 'train')
 * @returns {Icon} MotIcon
 * @category Utils
 */
const findMotIcon = name => {
  let result = null;
  switch (name) {
    case 'bus':
      result = <DirectionsBusIcon />;
      break;
    case 'ferry':
      result = <DirectionsBoatIcon />;
      break;
    case 'gondola':
      result = <RowingIcon />;
      break;
    case 'tram':
      result = <TramIcon />;
      break;
    case 'rail':
      result = <DirectionsRailwayIcon />;
      break;
    case 'funicular':
      result = <DirectionsSubwayIcon />;
      break;
    case 'cable_car':
      result = <CallMergeIcon />;
      break;
    case 'subway':
      result = <SubwayIcon />;
      break;
    default:
      result = <DirectionsBusIcon />;
      break;
  }
  return result;
};

export default findMotIcon;
