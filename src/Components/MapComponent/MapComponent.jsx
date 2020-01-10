import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import {Vector as VectorSource} from 'ol/source';
import axios from 'axios';
import "./MapComponent.css";
import {Stroke, Style} from "ol/style";

class MapComponent extends Component {
    constructor(props) {
        super(props);
        this.findRouteCancelToken = axios.CancelToken;
        this.findRouteCancel = null;
        this.routeStyle = new Style({
            stroke: new Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            })
        });
    }

    componentDidMount() {
        const openStreetMap = new TileLayer({
            source: new OSM()
        });
        this.map = new Map({
            target: 'map',
            layers: [openStreetMap],
            view: new View({
                projection: 'EPSG:4326',
                center: [25, 25],
                zoom: 4
            }),
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.hops && this.props.hops !== prevProps.hops) {
            if (this.findRouteCancel)
                this.findRouteCancel();
            axios.get(this.props.routingUrl, {
                params: {
                    via: this.props.hops.join("|"),
                    mot: this.props.mot,
                    key: this.props.APIKey
                },
                cancelToken: new this.findRouteCancelToken((cancel) => {
                    this.findRouteCancel = cancel;
                })
            })
                .then((response) => {
                    const vectorSource = new VectorSource({
                        features: (new GeoJSON()).readFeatures(response.data)
                    });
                    const vectorLayer = new VectorLayer({
                        source: vectorSource,
                        style: this.routeStyle
                    });
                    this.map.addLayer(vectorLayer);
                    this.map.getView().fit(vectorSource.getExtent(), this.map.getSize());
                }, (error) => {
                    console.log(error);
                });
        }
    }

    render() {
        return (
            <div id="map" className="MapComponent"/>
        );
    }
}

const mapStateToProps = state => {
    return {
        hops: state.MapReducer.hops,
        mot: state.MapReducer.mot,
    };
};

export default connect(mapStateToProps)(MapComponent);