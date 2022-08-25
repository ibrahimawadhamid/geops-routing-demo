/* eslint-disable no-undef */
import mapReducer from './Map';
import * as types from '../actions/actionTypes';

describe('map reducer', () => {
  it('should return the initial state', () => {
    const test = {
      center: [949042.143189, 5899715.591163],
      currentMot: 'rail',
      floorInfo: ['0', '0'],
      currentStops: ['', ''],
      currentStopsGeoJSON: [],
      dialogPosition: {
        x: 10,
        y: 280,
      },
      dialogSize: {
        height: 550,
        width: 500,
      },
      clickLocation: null,
      notificationMessage: '',
      notificationType: 'info',
      isFieldFocused: false,
      showLoadingBar: false,
      resolveHops: false,
      selectedRoutes: [],
    };
    Object.keys(test).forEach(state => {
      expect(mapReducer(undefined, {})[state]).toEqual(test[state]);
    });
  });

  it('should handle SET_CURRENT_MOT first time', () => {
    expect(
      mapReducer(
        {},
        {
          type: types.SET_CURRENT_MOT,
          currentMot: 'bus',
        },
      ),
    ).toEqual({ currentMot: 'bus', isRouteInfoOpen: false });
  });

  it('should handle SET_CURRENT_MOT second time', () => {
    expect(
      mapReducer(
        { currentMot: 'bus' },
        {
          type: types.SET_CURRENT_MOT,
          currentMot: 'train',
        },
      ),
    ).toEqual({
      currentMot: 'train',
      isRouteInfoOpen: false,
    });
  });

  it('should handle SET_CURRENT_STOPS_GEOJSON', () => {
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
    expect(
      mapReducer(
        {},
        {
          type: types.SET_CURRENT_STOPS_GEOJSON,
          currentStopsGeoJSON,
        },
      ),
    ).toEqual({ currentStopsGeoJSON });
  });

  it('should handle SET_CLICK_LOCATION', () => {
    expect(
      mapReducer(
        {},
        {
          type: types.SET_CLICK_LOCATION,
          clickLocation: [25, 25],
        },
      ),
    ).toEqual({ clickLocation: [25, 25] });
  });

  it('should handle SHOW_NOTIFICATION', () => {
    expect(
      mapReducer(
        {},
        {
          type: types.SHOW_NOTIFICATION,
          notificationMessage: 'Notification Message',
          notificationType: 'error',
        },
      ),
    ).toEqual({
      notificationMessage: 'Notification Message',
      notificationType: 'error',
    });
  });
});
