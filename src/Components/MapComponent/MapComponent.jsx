import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, View } from 'ol';
import { toLonLat } from 'ol/proj';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import mapboxgl from 'mapbox-gl';
import _ from 'lodash/core';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { defaults as defaultInteractions, Translate } from 'ol/interaction';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import RoutingMenu from '../RoutingMenu';
import {
  lineStyleFunction,
  pointStyleFunction,
} from '../../config/styleConfig';
import {
  propTypeCurrentStops,
  propTypeCurrentStopsGeoJSON,
} from '../../store/prop-types';
import { GRAPHHOPPER_MOTS } from '../../constants';
import { to4326 } from '../../utils';
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

let abortController = new AbortController();

/**
 * The only true map that shows inside the application.
 * @category Map
 */
class MapComponent extends Component {
  static getExtentCenter = extent => {
    const X = extent[0] + (extent[2] - extent[0]) / 2;
    const Y = extent[1] + (extent[3] - extent[1]) / 2;
    return [X, Y];
  };

  /**
   * Default constructor, gets called automatically upon initialization.
   * @param {...MapComponentProps} props Props received so that the component can function properly.
   * @category Map
   */
  constructor(props) {
    super(props);
    this.hoveredFeature = null;
    this.hoveredRoute = null;
    this.state = {
      hoveredStationOpen: false,
      hoveredStationName: '',
      isActiveRoute: false,
    };
  }

  /**
   * Create Openlayers map (source, view, layer, etc...).
   * Add event listener onClick to handle location selection from map.
   * @category Map
   */
  componentDidMount() {
    const { APIKey, onSetClickLocation } = this.props;
    const center = [949042.143189, 5899715.591163];

    // Define stop vectorLayer.
    this.markerVectorSource = new VectorSource({});
    this.markerVectorLayer = new VectorLayer({
      zIndex: 1,
      source: this.markerVectorSource,
    });
    // Define route vectorLayer.
    this.routeVectorSource = new VectorSource({});
    this.routeVectorLayer = new VectorLayer({
      zIndex: 0,
      source: this.routeVectorSource,
    });

    const translate = new Translate({
      layers: [this.markerVectorLayer],
    });

    const isItemInArray = (array, item) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][0] === item[0] && array[i][1] === item[1]) {
          return i;
        }
      }
      return -1;
    };

    const handleMapCursor = isHovering => {
      if (isHovering) {
        document.body.classList.add('rd-pointer');
      } else if (document.body.classList.contains('rd-pointer')) {
        document.body.classList.remove('rd-pointer');
      }
    };

    translate.on('translateend', evt => {
      const {
        currentStops,
        currentStopsGeoJSON,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;
      const newCurrentStops = _.clone(currentStops);
      const newCurentStopsGeoJSON = _.clone(currentStopsGeoJSON);

      const { name, id } = evt.features.getArray()[0].getProperties();
      let featureIndex;
      if (name) {
        featureIndex = currentStops.indexOf(name);
      } else {
        featureIndex = isItemInArray(currentStops, id.slice().reverse());
      }
      newCurrentStops[featureIndex] = evt.coordinate;
      newCurentStopsGeoJSON[featureIndex] = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: evt.coordinate.slice().reverse(),
              type: 'coordinates',
            },
            geometry: {
              type: 'Point',
              coordinates: evt.coordinate,
            },
          },
        ],
      };
      onSetCurrentStops(newCurrentStops);
      onSetCurrentStopsGeoJSON(newCurentStopsGeoJSON);
    });

    this.map = new Map({
      target: 'map',
      interactions: defaultInteractions().extend([translate]),
      view: new View({
        projection: 'EPSG:3857',
        center,
        zoom: 6,
      }),
    });

    const mbMap = new mapboxgl.Map({
      style: `https://maps.geops.io/styles/travic/style.json?key=${APIKey}`,
      attributionControl: false,
      boxZoom: false,
      center: toLonLat(center),
      container: this.map.getTargetElement(),
      doubleClickZoom: false,
      dragPan: false,
      dragRotate: false,
      interactive: false,
      keyboard: false,
      pitchWithRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
    });

    /* eslint-disable no-underscore-dangle */
    const mbLayer = new Layer({
      render: frameState => {
        const canvas = mbMap.getCanvas();
        const { viewState } = frameState;

        const visible = mbLayer.getVisible();
        canvas.style.display = visible ? 'block' : 'none';

        const opacity = mbLayer.getOpacity();
        canvas.style.opacity = opacity;

        // adjust view parameters in mapbox
        const { rotation } = viewState;
        if (rotation) {
          mbMap.rotateTo((-rotation * 180) / Math.PI, {
            animate: false,
          });
        }
        mbMap.jumpTo({
          center: toLonLat(viewState.center),
          zoom: viewState.zoom - 1,
          animate: false,
        });

        if (mbMap._frame) {
          mbMap._frame.cancel();
          mbMap._frame = null;
        }
        mbMap._render();

        return canvas;
      },
    });

    [mbLayer, this.markerVectorLayer, this.routeVectorLayer].forEach(l =>
      this.map.addLayer(l),
    );

    this.onZoomRouteClick = () => {
      let featExtent;
      if (this.routeVectorSource.getFeatures().length) {
        featExtent = this.routeVectorSource.getExtent();
      }

      if (featExtent.filter(f => Number.isFinite(f)).length === 4) {
        this.map.getView().fit(this.routeVectorSource.getExtent(), {
          size: this.map.getSize(),
          duration: 500,
          padding: [200, 200, 200, 200],
        });
      }
    };

    this.onPanViaClick = (item, idx) => {
      const { currentStopsGeoJSON } = this.props;
      if (currentStopsGeoJSON && currentStopsGeoJSON[idx]) {
        const featureCoord = currentStopsGeoJSON[idx].features
          ? currentStopsGeoJSON[idx].features[0].geometry.coordinates
          : currentStopsGeoJSON[idx].geometry.coordinates;

        this.map.getView().animate({
          center: featureCoord,
          duration: 500,
          padding: [100, 100, 100, 100],
        });
      }
    };

    this.map.on('singleclick', evt => {
      const { isFieldFocused, currentStops } = this.props;
      // if one field empty or if a field is focused
      if (currentStops.includes('') || isFieldFocused) {
        onSetClickLocation(evt.coordinate);
      }
    });
    this.map.on('pointermove', evt => {
      const { currentMot } = this.props;

      if (this.hoveredFeature) {
        this.hoveredFeature = null;
        this.setState({ hoveredStationOpen: false, hoveredStationName: '' });
      }

      if (this.hoveredRoute) {
        this.hoveredRoute.setStyle(lineStyleFunction(currentMot, false));
        this.hoveredRoute = null;
      }
      const hovFeats = this.map.getFeaturesAtPixel(evt.pixel);
      handleMapCursor(hovFeats.length);

      hovFeats.forEach(feature => {
        if (feature.getGeometry().getType() === 'Point') {
          this.hoveredFeature = feature;
          let name = '';
          const featCountryCode = feature.get('country_code');
          if (feature.get('name')) {
            name = `${feature.get('name')}${
              featCountryCode ? ` - ${featCountryCode}` : ''
            }`;
          } else {
            name = `${to4326(feature.getGeometry().flatCoordinates)}`;
          }
          this.setState({
            hoveredStationOpen: true,
            hoveredStationName: name,
          });
        }
        if (feature.getGeometry().getType() === 'LineString') {
          this.hoveredRoute = feature;
          feature.setStyle(lineStyleFunction(currentMot, true));
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
      this.markerVectorSource.clear();
      Object.keys(currentStopsGeoJSON).forEach(key => {
        this.markerVectorSource.addFeatures(
          new GeoJSON().readFeatures(currentStopsGeoJSON[key]),
        );
        this.markerVectorSource
          .getFeatures()
          .forEach(f => f.setStyle(pointStyleFunction(currentMot)));
      });
      // Remove the old route if exists
      this.routeVectorSource.clear();
      this.setIsActiveRoute(false);

      // Draw a new route if more than 1 stop is defined
      if (Object.keys(currentStopsGeoJSON).length > 1) {
        this.drawNewRoute();
      }
    }
  }

  setIsActiveRoute(isActiveRoute) {
    this.setState({ isActiveRoute });
  }

  /**
   * After receiving the updated stops, send a call to the routingAPI to find a suitable route between
   * two points/stations, if a route is found, it's returned and drawn to the map.
   * @category Map
   */
  drawNewRoute = () => {
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
        hops.push(
          `${to4326(currentStopsGeoJSON[key].features[0].geometry.coordinates)
            .slice()
            .reverse()}`,
        );
      } else if (currentMot === 'rail' || currentMot === 'bus') {
        hops.push(`!${currentStopsGeoJSON[key].properties.uid}`);
      } else {
        hops.push(`${currentStopsGeoJSON[key].properties.name}`);
      }
    });

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const reqUrl = `${routingUrl}?via=${hops.join(
      '|',
    )}&mot=${currentMot}&resolve-hops=false&srs=3857&key=${APIKey}`;

    fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          onShowNotification("Couldn't find route", 'error');
          return;
        }
        // A route was found, prepare to draw it.
        this.routeVectorSource.clear();
        const format = GRAPHHOPPER_MOTS.includes(currentMot)
          ? new GeoJSON({
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857',
            })
          : new GeoJSON();
        this.routeVectorSource.addFeatures(format.readFeatures(response));
        this.setIsActiveRoute(!!this.routeVectorSource.getFeatures().length);

        this.routeVectorSource
          .getFeatures()
          .forEach(f => f.setStyle(lineStyleFunction(currentMot)));
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.warn(`Abort ${reqUrl}`);
          return;
        }
        // It's important to rethrow all other errors so you don't silence them!
        // For example, any error thrown by setState(), will pass through here.
        throw err;
      });
  };

  /**
   * Render the map component to the dom
   * @category Map
   */
  render() {
    const { mots, APIKey, stationSearchUrl } = this.props;
    const {
      isActiveRoute,
      hoveredStationOpen,
      hoveredStationName,
    } = this.state;
    return (
      <>
        <RoutingMenu
          mots={mots}
          stationSearchUrl={stationSearchUrl}
          isActiveRoute={isActiveRoute}
          onZoomRouteClick={this.onZoomRouteClick}
          onPanViaClick={this.onPanViaClick}
          APIKey={APIKey}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={hoveredStationOpen}
          message={hoveredStationName}
        />
        <div id="map" className="rd-map-comp" />
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentMot: state.MapReducer.currentMot,
    currentStops: state.MapReducer.currentStops,
    currentStopsGeoJSON: state.MapReducer.currentStopsGeoJSON,
    isFieldFocused: state.MapReducer.isFieldFocused,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetCurrentStops: currentStops =>
      dispatch(actions.setCurrentStops(currentStops)),
    onSetCurrentStopsGeoJSON: currentStopsGeoJSON =>
      dispatch(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)),
    onSetClickLocation: clickLocation =>
      dispatch(actions.setClickLocation(clickLocation)),
    onShowNotification: (notificationMessage, notificationType) =>
      dispatch(actions.showNotification(notificationMessage, notificationType)),
  };
};

MapComponent.propTypes = {
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  onSetClickLocation: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  onSetCurrentStops: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops.isRequired,
  currentStopsGeoJSON: propTypeCurrentStopsGeoJSON.isRequired,
  isFieldFocused: PropTypes.bool.isRequired,
  routingUrl: PropTypes.string.isRequired,
  currentMot: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
