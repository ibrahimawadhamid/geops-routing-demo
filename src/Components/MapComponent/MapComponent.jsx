import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import axios from 'axios';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import { Stroke, Style, Fill, Circle as CircleStyle } from 'ol/style';
import './MapComponent.css';
import * as actions from '../../store/actions';

/**
 * The map props
 * @typedef MapComponentProps
 * @type {props}
 * @property {string} APIKey key obtained from geOps that enables you to used the previous API services.
 * @property {string} routingUrl The API routing url to be used for navigation.
 * @property {string} currentMot The current selected mot by user, example 'bus'.
 * @property {Object} currentStopsGeoJSON The current stops defined by user in geojson format inside a dictionary, key is the stop index(order) and the value is the geoJSON itself.
 * @property {function} onShowNotification A store action that can be dispatched, takes the notification message and type as arguments.
 * @property {function} onSetClickLocation A store action that can be dispatched, takes the clicked location on map array of [long,lat] and stores it in the store.
 * @category Props
 */

/**
 * The only true map that shows inside the application.
 * @category Map
 */
class MapComponent extends Component {
  /**
   * Default constructor, gets called automatically upon initialization.
   * @param {...MapComponentProps} props Props received so that the component can function properly.
   * @category Map
   */
  constructor(props) {
    super(props);
    this.FindRouteCancelToken = axios.CancelToken;
    this.findRouteCancel = null;
    this.routeStyleInner = new Style({
      stroke: new Stroke({
        color: 'orange',
        width: 3,
      }),
    });
    this.routeStyleOuter = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 5,
      }),
    });
    this.pointStyle = new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'orange' }),
        stroke: new Stroke({ color: 'black', width: 2 }),
      }),
    });
    this.hoveredFeature = null;
    this.state = {
      hoveredStationOpen: false,
      hoveredStationName: '',
    };
  }

  /**
   * Create Openlayers map (source, view, layer, etc...).
   * Add event listener onClick to handle location selection from map.
   * @category Map
   */
  componentDidMount() {
    let demoAttribution =
      "<a target='_blank' href='https://github.com/ibrahimawadhamid/geops-routing-demo'>Demo</a>";
    demoAttribution +=
      " | <a target='_blank' href='https://geops.ch/'>geOps</a>";
    demoAttribution +=
      " | <a target='_blank' href='https://www.openstreetmap.org/'>OSM</a>";
    const openStreetMap = new TileLayer({
      source: new OSM({ attributions: [demoAttribution] }),
    });
    this.map = new Map({
      target: 'map',
      layers: [openStreetMap],
      view: new View({
        projection: 'EPSG:4326',
        center: [10, 50],
        zoom: 6,
      }),
    });
    this.map.on('singleclick', evt => {
      const { onSetClickLocation } = this.props;
      onSetClickLocation(evt.coordinate);
    });
    this.map.on('pointermove', evt => {
      if (this.hoveredFeature) {
        this.hoveredFeature = null;
        this.setState({ hoveredStationOpen: false, hoveredStationName: '' });
      }
      this.map.forEachFeatureAtPixel(evt.pixel, feature => {
        if (feature.getGeometry().getType() === 'Point') {
          this.hoveredFeature = feature;
          let name = '';
          if (feature.get('name'))
            name = `${feature.get('name')} - ${feature.get('country_code')}`;
          else name = `${feature.get('id')[0]}, ${feature.get('id')[1]}`;
          this.setState({
            hoveredStationOpen: true,
            hoveredStationName: name,
          });
        }
        return true;
      });
    });
  }

  /**
   * Perform the necessary actions when receiving updated props.
   * If new stops are received, then remove any existing stops/routes and draw those stops/routes.
   * @category Map
   */
  componentDidUpdate(prevProps) {
    const { currentStopsGeoJSON, currentMot } = this.props;
    const currentMotChanged = currentMot && currentMot !== prevProps.currentMot;
    const currentStopsGeoJSONChanged =
      currentStopsGeoJSON &&
      currentStopsGeoJSON !== prevProps.currentStopsGeoJSON;
    if (currentMotChanged || currentStopsGeoJSONChanged) {
      // First remove layers
      this.map.getLayers().forEach(layer => {
        if (layer && layer.get('type') === 'markers') {
          this.map.removeLayer(layer);
        }
      });
      // Then add new ones
      Object.keys(currentStopsGeoJSON).forEach(key => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(currentStopsGeoJSON[key]),
        });
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: this.pointStyle,
        });
        vectorLayer.set('type', 'markers');
        this.map.addLayer(vectorLayer);
        const coordinate = vectorSource
          .getFeatures()[0]
          .getGeometry()
          .getCoordinates();
        this.map.getView().animate({
          center: coordinate,
          duration: 500,
        });
      });
      // Remove the old route if exists
      this.removeCurrentRoute();
      // Draw a new route if more than 1 stop is defined
      if (Object.keys(currentStopsGeoJSON).length > 1) {
        this.drawNewRoute();
      }
    }
  }

  /**
   * After receiving the updated stops, send a call to the routingAPI to find a suitable route between
   * two points/stations, if a route is found, it's returned and drawn to the map.
   * @category Map
   */
  drawNewRoute = () => {
    if (this.findRouteCancel) this.findRouteCancel();
    const hops = [];
    const {
      currentStopsGeoJSON,
      routingUrl,
      currentMot,
      APIKey,
      onShowNotification,
    } = this.props;
    Object.keys(currentStopsGeoJSON).forEach(key => {
      if (currentStopsGeoJSON[key].features) {
        // If the current item is a point selected on the map, not a station.
        hops.push(`@${currentStopsGeoJSON[key].features[0].properties.id}`);
      } else {
        // The item selected is a station from the stations API.
        hops.push(`!${currentStopsGeoJSON[key].properties.id}`);
      }
    });
    axios
      .get(routingUrl, {
        params: {
          via: hops.join('|'),
          mot: currentMot,
          key: APIKey,
        },
        cancelToken: new this.FindRouteCancelToken(cancel => {
          this.findRouteCancel = cancel;
        }),
      })
      .then(
        response => {
          // A route was found, prepare to draw it.
          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(response.data),
          });
          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: [this.routeStyleOuter, this.routeStyleInner],
          });
          vectorLayer.set('type', 'route');
          this.map.addLayer(vectorLayer);
          this.map.getView().fit(vectorSource.getExtent(), {
            size: this.map.getSize(),
            duration: 500,
            padding: [50, 50, 50, 50],
          });
        },
        error => {
          // No route was found.
          if (error) onShowNotification("Couldn't find route", 'error');
        },
      );
  };

  /**
   * Remove the current route drawn on the map
   * @category Map
   */
  removeCurrentRoute = () => {
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get('type') === 'route') {
        this.map.removeLayer(layer);
      }
    });
  };

  /**
   * Render the map component to the dom
   * @category Map
   */
  render() {
    const { hoveredStationOpen, hoveredStationName } = this.state;
    return (
      <>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={hoveredStationOpen}
          message={hoveredStationName}
        />
        <div id="map" className="MapComponent" />
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentMot: state.MapReducer.currentMot,
    currentStopsGeoJSON: state.MapReducer.currentStopsGeoJSON,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetClickLocation: clickLocation =>
      dispatch(actions.setClickLocation(clickLocation)),
    onShowNotification: (notificationMessage, notificationType) =>
      dispatch(actions.showNotification(notificationMessage, notificationType)),
  };
};

MapComponent.propTypes = {
  onSetClickLocation: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  currentStopsGeoJSON: PropTypes.object.isRequired,
  APIKey: PropTypes.string.isRequired,
  routingUrl: PropTypes.string.isRequired,
  currentMot: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
