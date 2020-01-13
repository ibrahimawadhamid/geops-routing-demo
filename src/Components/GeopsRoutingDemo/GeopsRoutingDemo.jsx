import React from 'react';
import {Provider} from 'react-redux';
import store from '../../store/store';
import MapComponent from "../MapComponent";
import RoutingMenu from "../RoutingMenu/RoutingMenu";

function GeopsRoutingDemo(props) {
    return (
        <Provider store={store}>
            <RoutingMenu {...props}/>
            <MapComponent {...props}/>
        </Provider>
    );
}

export default GeopsRoutingDemo;
