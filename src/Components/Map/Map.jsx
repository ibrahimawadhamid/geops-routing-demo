import React, {Component} from 'react';
import L from 'leaflet';
import RoutingMenu from "../RoutingMenu/RoutingMenu";
import "./Map.css";

class Map extends Component {
    componentDidMount() {
        const applicationVersion = `${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION}`;
        const stamenTonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: applicationVersion + ' | Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        });

        this.map = L.map('map', {
            center: [25, 25],
            zoom: 4,
            zoomControl: false,
            layers: [stamenTonerLite]
        });
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);
    }

    render() {
        return (
            <div>
                <RoutingMenu/>
                <div id="map" className="map"/>
            </div>
        );
    }
}

export default Map;