import React, {Component} from 'react';
import {Map, View} from 'ol';
import {Tile as TileLayer} from 'ol/layer';
import Stamen from 'ol/source/Stamen';
import "./MapComponent.css";

class MapComponent extends Component {
    componentDidMount() {
        const stamenLayer = new TileLayer({
            source: new Stamen({
                layer: 'toner-lite'
            })
        });
        this.map = new Map({
            target: 'map',
            layers: [stamenLayer],
            view: new View({
                projection: 'EPSG:3857',
                center: [1023644,6428137],
                zoom: 6
            }),
        });

    }

    render() {
        return (
            <div id="map" className="MapComponent"/>
        );
    }
}

export default MapComponent;