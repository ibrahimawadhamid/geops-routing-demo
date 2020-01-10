import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GeopsRoutingDemo from './Components';
import * as serviceWorker from './serviceWorker';

const geopsRoutingDemo =
    <GeopsRoutingDemo
        mots={['rail','bus','tram']}
        routingUrl="https://api.geops.io/routing/v1/"
        stationSearchUrl="https://api.geops.io/stops/v1/"
        key="5cc87b12d7c5370001c1d655d0a18192eba64838a5fa1ad7d482ab82"
    />;
ReactDOM.render(geopsRoutingDemo, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
