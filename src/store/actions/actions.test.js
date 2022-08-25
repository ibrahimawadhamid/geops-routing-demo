/* eslint-disable no-undef */
import * as actions from './index';
import * as types from './actionTypes';

describe('actions', () => {
  it('should create an action to set the current mot', () => {
    const currentMot = 'bus';
    const expectedAction = {
      type: types.SET_CURRENT_MOT,
      currentMot,
    };
    expect(actions.setCurrentMot(currentMot)).toEqual(expectedAction);
  });
  it('should create an action to set the click location', () => {
    const clickLocation = [25, 25];
    const expectedAction = {
      type: types.SET_CLICK_LOCATION,
      clickLocation,
    };
    expect(actions.setClickLocation(clickLocation)).toEqual(expectedAction);
  });
  it('should create an action to set the current stops GeoJSON', () => {
    // Create GeoJSON
    const tempGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            id: [25, 25].slice().reverse(),
            type: 'coordinates',
          },
          geometry: {
            type: 'Point',
            coordinates: [25, 25],
          },
        },
      ],
    };
    const currentStopsGeoJSON = [tempGeoJSON];
    const expectedAction = {
      type: types.SET_CURRENT_STOPS_GEOJSON,
      currentStopsGeoJSON,
    };
    expect(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)).toEqual(
      expectedAction,
    );
  });
  it('should create an action to show a notification', () => {
    const notificationMessage = 'Notification Message';
    const notificationType = 'error';
    const expectedAction = {
      type: types.SHOW_NOTIFICATION,
      notificationMessage,
      notificationType,
    };
    expect(
      actions.showNotification(notificationMessage, notificationType),
    ).toEqual(expectedAction);
  });
});
