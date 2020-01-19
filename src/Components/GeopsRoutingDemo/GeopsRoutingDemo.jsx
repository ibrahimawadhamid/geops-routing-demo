import React from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import store from "../../store/store";
import MapComponent from "../MapComponent";
import RoutingMenu from "../RoutingMenu/RoutingMenu";
import NotificationHandler from "../NotificationHandler";

/**
 * Root component of the application that holds all other sub-components.
 * @param {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @param {string} routingUrl The API routing url to be used for navigation.
 * @param {string} stationSearchUrl The API station search URL to be used for searching for stations.
 * @param {string} APIKey A key obtained from geOps that enables you to used the previous API services.
 */
function GeopsRoutingDemo(props) {
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

GeopsRoutingDemo.propTypes = {
  routingUrl: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  APIKey: PropTypes.string.isRequired,
  mots: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default GeopsRoutingDemo;
