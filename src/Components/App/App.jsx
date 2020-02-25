import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import store from '../../store/store';
import MapComponent from '../MapComponent';
import RoutingMenu from '../RoutingMenu';
import NotificationHandler from '../NotificationHandler';
import constants from '../../constants';

const propTypes = {
  routingUrl: PropTypes.string,
  stationSearchUrl: PropTypes.string,
  APIKey: PropTypes.string,
  mots: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  mots: constants.VALID_MOTS,
  routingUrl: 'https://api.geops.io/routing/v1/',
  stationSearchUrl: 'https://api.geops.io/stops/v1/',
  APIKey: '5cc87b12d7c5370001c1d655d0a18192eba64838a5fa1ad7d482ab82',
};

/**
 * Root component of the application that holds all other sub-components.
 * @param {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @param {string} routingUrl The API routing url to be used for navigation.
 * @param {string} stationSearchUrl The API station search URL to be used for searching for stations.
 * @param {string} APIKey A key obtained from geOps that enables you to used the previous API services.
 */
function App(props) {
  const { mots, routingUrl, stationSearchUrl, APIKey } = props;

  return (
    <Provider store={store}>
      <RoutingMenu
        mots={mots}
        stationSearchUrl={stationSearchUrl}
        APIKey={APIKey}
      />
      <MapComponent mots={mots} routingUrl={routingUrl} APIKey={APIKey} />
      <NotificationHandler />
    </Provider>
  );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
