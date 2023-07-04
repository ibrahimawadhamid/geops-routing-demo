/* eslint-disable no-undef */
import React from 'react';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsRailwayIcon from '@mui/icons-material/DirectionsRailway';
import findMotIcon from './findMotIcon';

describe('utils', () => {
  it('should return the correct icon', () => {
    let icon = findMotIcon('bus');
    expect(icon).toEqual(
      <span>
        <DirectionsBusIcon />
      </span>,
    );
    icon = findMotIcon('foot');
    expect(icon).toEqual(
      <span>
        <DirectionsWalkIcon />
      </span>,
    );
    icon = findMotIcon('rail');
    expect(icon).toEqual(
      <span>
        <DirectionsRailwayIcon />
      </span>,
    );
  });
});
