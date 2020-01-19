import React from 'react';
import ReactDOM from 'react-dom';
import GeopsRoutingDemo from "../src/index";

/**
 * Example usage of the demo component.
 */
ReactDOM.render(
    <GeopsRoutingDemo
        mots={['rail', 'bus', 'tram']}
        routingUrl="https://api.geops.io/routing/v1/"
        stationSearchUrl="https://api.geops.io/stops/v1/"
        APIKey="5cc87b12d7c5370001c1d655d0a18192eba64838a5fa1ad7d482ab82"
    />,
    document.getElementById('app')
)