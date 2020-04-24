import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import store from '../../store/store';
import MapComponent from '../MapComponent';
import NotificationHandler from '../NotificationHandler';
import { VALID_MOTS } from '../../constants';

const propTypes = {
  routingUrl: PropTypes.string,
  stationSearchUrl: PropTypes.string,
  mots: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  mots: VALID_MOTS,
  // routingUrl: 'https://api.geops.io/routing/dev/',
  routingUrl: 'https://pedestrian.dev.geops.io/routing',
  // routingUrl: 'https://api.geops.io/route-decorator/v1/decorate_route',
  stationSearchUrl: 'https://api.geops.io/stops/dev/',
};

/**
 * Root component of the application that holds all other sub-components.
 * @param {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @param {string} routingUrl The API routing url to be used for navigation.
 * @param {string} stationSearchUrl The API station search URL to be used for searching for stations.
 */
function App(props) {
  const { mots, routingUrl, stationSearchUrl } = props;
  const apiKey = process.env.REACT_APP_API_KEY;

  return (
    <Provider store={store}>
      <MapComponent
        mots={mots}
        routingUrl={routingUrl}
        APIKey={apiKey}
        stationSearchUrl={stationSearchUrl}
      />
      <NotificationHandler />
    </Provider>
  );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
