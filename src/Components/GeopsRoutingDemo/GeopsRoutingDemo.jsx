import React from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import store from "../../store/store";
import MapComponent from "../MapComponent";
import RoutingMenu from "../RoutingMenu/RoutingMenu";
import NotificationHandler from "../NotificationHandler";

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
