/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Map, View } from 'ol';
import SearchResults from './SearchResults';

Enzyme.configure({ adapter: new Adapter() });

describe('Search Results', () => {
  const mockStore = configureStore([thunk]);

  it('should render self and subcomponents', () => {
    const props = {
      currentSearchResults: [
        {
          properties: {
            name: 'Test Name',
            code: 'Test Code',
            country_code: 'Test Country Code',
          },
        },
      ],
      processClickedResultHandler: jest.fn(),
    };

    const target = document.createElement('div');
    const map = new Map({
      target,
      view: new View({}),
    });

    const store = mockStore({
      MapReducer: {
        olMap: map,
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <SearchResults
          currentSearchResults={props.currentSearchResults}
          processClickedResultHandler={props.processClickedResultHandler}
        />
        ,
      </Provider>,
    );
    const navList = wrapper.find('WithStyles(ForwardRef(List))');
    const navItem = navList.find('WithStyles(ForwardRef(ListItemText))');
    expect(navItem.props().primary).toEqual(
      props.currentSearchResults[0].properties.name,
    );
  });
});
