/* eslint-disable no-undef */
import React from 'react';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import findMotIcon from './utils';

describe('utils', () => {
  it('should return the correct icon', () => {
    let icon = findMotIcon('bus');
    expect(icon).toEqual(
      <span title="Bus">
        <DirectionsBusIcon />
      </span>,
    );
    icon = findMotIcon('coach');
    expect(icon).toEqual(
      <span title="Coach">
        <DirectionsBusIcon />
      </span>,
    );
    icon = findMotIcon('pedestrian');
    expect(icon).toEqual(
      <span title="Pedestrian">
        <DirectionsWalkIcon />
      </span>,
    );
    icon = findMotIcon('rail');
    expect(icon).toEqual(
      <span title="Rail">
        <DirectionsRailwayIcon />
      </span>,
    );
  });
});
