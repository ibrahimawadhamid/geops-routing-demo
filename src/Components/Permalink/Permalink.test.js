/* eslint-disable no-undef */
import React from 'react';
import { configure, mount } from 'enzyme';
import thunk from 'redux-thunk';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Map } from 'ol';
import Permalink from './Permalink';

configure({ adapter: new Adapter() });

describe('Permalink', () => {
  const setState = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState');
  useStateSpy.mockImplementation(init => [init, setState]);
  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    global.window = Object.create(window);
    store = mockStore({
      MapReducer: {
        center: [0, 0],
        currentMot: 'rail',
        resolveHops: false,
        currentStops: ['', ''],
        floorInfo: [null, null],
        currentStopsGeoJSON: {},
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
    const component = mount(
      <Provider store={store}>
        <Permalink
          mots={['rail', 'bus']}
          APIKey="foobar"
          stationSearchUrl="https://foo.bar"
        />
      </Provider>,
    );

    expect(component.props().store.getActions().length).toBe(0);
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

    const component = mount(
      <Provider store={store}>
        <Permalink
          mots={['rail', 'bus']}
          APIKey="foobar"
          stationSearchUrl="https://foo.bar"
        />
      </Provider>,
    );

    expect(component.props().store.getActions()[0]).toEqual({
      type: 'SET_CURRENT_MOT',
      currentMot: 'bus',
    });
    /*
    expect(component.props().store.getActions()[2]).toEqual({
      type: 'SET_RESOLVE_HOPS',
      resolveHops: true,
    });
    */
  });
});
