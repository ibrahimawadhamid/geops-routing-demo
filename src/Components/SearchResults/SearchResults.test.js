import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Map, View } from 'ol';
import { render } from '@testing-library/react';
import { prettyDOM } from '@testing-library/dom';
import SearchResults from './SearchResults';

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

    const { container } = render(
      <Provider store={store}>
        <SearchResults
          currentSearchResults={props.currentSearchResults}
          processClickedResultHandler={props.processClickedResultHandler}
        />
        ,
      </Provider>,
    );
    const navItem = container.querySelector('.MuiListItemText-primary');
    expect(navItem.textContent).toEqual(
      props.currentSearchResults[0].properties.name,
    );
  });
});
