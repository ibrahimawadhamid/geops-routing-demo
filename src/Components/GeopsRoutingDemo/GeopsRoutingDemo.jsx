import React from 'react';
import MapComponent from "../MapComponent";
import RoutingMenu from "../RoutingMenu/RoutingMenu";

function GeopsRoutingDemo(props) {
    return (
        <div>
            <RoutingMenu {...props}/>
            <MapComponent/>
        </div>
    );
}

export default GeopsRoutingDemo;
