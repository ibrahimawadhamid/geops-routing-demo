import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Map } from 'ol';
import mediaQuery from 'css-mediaquery';
import DebugDialog from './DebugDialog';
import fixture from './fixture';

function createMatchMedia(width) {
  return (query) => ({
    matches: mediaQuery.match(query, {
      width,
    }),
    addListener: () => {},
    removeListener: () => {},
  });
}

describe('DebugDialog', () => {
  const mockStore = configureStore([thunk]);
  let store;
  // Mock desktop window size
  // https://mui.com/material-ui/react-use-media-query/#testing
  window.matchMedia = createMatchMedia(window.innerWidth);

  beforeEach(() => {
    store = mockStore({
      MapReducer: {
        center: [0, 0],
        currentMot: 'rail',
        resolveHops: false,
        currentStops: ['', ''],
        selectedRoutes: fixture.routes,
        currentStopsGeoJSON: fixture.geoJson,
        olMap: new Map({
          controls: [],
        }),
        floorInfo: [null, null],
        tracks: [null, null],
      },
    });
  });

  it('should render the yaml code values correctly', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <DebugDialog />
      </Provider>,
    );
    expect(getByTestId('header').innerHTML).toBe('rail-xx:');
    expect(getByTestId('mot').innerHTML).toBe('rail');
    expect(getByTestId('viaString').innerHTML).toBe(
      "'!4be65028749bb705|!bed0b934e1c5647c'",
    );
    expect(getByTestId('expected-viastring-0').innerHTML).toBe(
      '    - 7.59589,47.54508',
    );
    expect(getByTestId('expected-viastring-1').innerHTML).toBe(
      '    - 7.60670,47.54596',
    );
    expect(getByTestId('expected-viastring-2').innerHTML).toBe(
      '    - 7.61551,47.54955',
    );
    expect(getByTestId('expected-viastring-3').innerHTML).toBe(
      '    - 7.61526,47.55715',
    );
    expect(getByTestId('expected-viastring-4').innerHTML).toBe(
      '    - 7.61035,47.56419',
    );
    expect(getByTestId('min_km').innerHTML).toBe('4.211');
    expect(getByTestId('max_km').innerHTML).toBe('4.467');
  });

  it('should not render on mobile', async () => {
    window.matchMedia = createMatchMedia(375);
    const { container } = render(
      <Provider store={store}>
        <DebugDialog />
      </Provider>,
    );
    expect(container.innerHTML).toBeFalsy();
  });
});
