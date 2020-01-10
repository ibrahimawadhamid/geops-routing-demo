import React from 'react';
import Map from "../Map";
import RoutingMenu from "../RoutingMenu/RoutingMenu";

function GeopsRoutingDemo(props) {
    return (
        <div>
            <RoutingMenu {...props}/>
            <Map/>
        </div>
    );
}

export default GeopsRoutingDemo;
