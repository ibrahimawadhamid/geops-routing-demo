import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { Map } from 'ol';
import Permalink from './Permalink';

describe('Permalink', () => {
  const setState = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation((init) => [init, setState]);
  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    store = mockStore({
      MapReducer: {
        center: [0, 0],
        currentMot: 'rail',
        resolveHops: false,
        currentStops: ['', ''],
        floorInfo: [null, null],
        currentStopsGeoJSON: [],
        olMap: new Map({
          controls: [],
        }),
        tracks: [null, null],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not dispatch search params in default state', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
    render(
      <Provider store={store}>
        <Permalink
          mots={['rail', 'bus']}
          APIKey="foobar"
          stationSearchUrl="https://foo.bar"
        />
      </Provider>,
    );

    expect(store.getActions().length).toBe(0);
  });

  it('should dispatch defined URL search params', () => {
    const searchString =
      '?via=!7e7dbbe3be4bc3a6|!a4dca961d199ff76&mot=bus&resolve-hops=true&elevation=2';

    Object.defineProperty(window, 'location', {
      value: {
        search: searchString,
      },
      writable: true,
    });

    render(
      <Provider store={store}>
        <Permalink
          mots={['rail', 'bus']}
          APIKey="foobar"
          stationSearchUrl="https://foo.bar"
        />
      </Provider>,
    );

    expect(store.getActions()[0]).toEqual({
      type: 'SET_CURRENT_MOT',
      currentMot: 'bus',
    });
    expect(store.getActions()[2]).toEqual({
      type: 'SET_RESOLVE_HOPS',
      resolveHops: true,
    });
  });
});
