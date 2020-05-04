import React, { createRef, Component } from 'react';
import { connect } from 'react-redux';
import ConfigReader from 'react-spatial/ConfigReader';
import LayerService from 'react-spatial/LayerService';
import Layer from 'react-spatial/layers/Layer';
import BasicMap from 'react-spatial/components/BasicMap';
import { Map, Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import _ from 'lodash/core';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import {
  defaults as defaultInteractions,
  Translate,
  // Modify,
} from 'ol/interaction';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import RoutingMenu from '../RoutingMenu';
import RouteInfosDialog from '../RouteInfosDialog';
import {
  lineStyleFunction,
  pointStyleFunction,
} from '../../config/styleConfig';
import {
  propTypeCoordinates,
  propTypeCurrentStops,
  propTypeCurrentStopsGeoJSON,
} from '../../store/prop-types';
import { GRAPHHOPPER_MOTS } from '../../constants';
import { to4326 } from '../../utils';
import './MapComponent.scss';
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
const zoom = 17;

const FLOOR_REGEX = /\$-?(?:[0-9][0-9]?|100)$/;
const FLOOR_REGEX_CAPTURE = /\$(-?(?:[1-9][0-9]?|100))$/;

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

  static indexInGeom = (lineGeom, point) => {
    const firstBreakIdx = lineGeom.indexOf(point[0]);
    const secondBreakIdx = lineGeom.indexOf(point[1]);

    return firstBreakIdx === secondBreakIdx - 1;
  };

  /**
   * Default constructor, gets called automatically upon initialization.
   * @param {...MapComponentProps} props Props received so that the component can function properly.
   * @category Map
   */
  constructor(props) {
    super(props);
    const { APIKey, onSetClickLocation } = this.props;
    this.mapRef = createRef();
    this.hoveredFeature = null;
    this.hoveredRoute = null;
    this.initialRouteDrag = null;
    this.state = {
      hoveredStationOpen: false,
      hoveredStationName: '',
      isActiveRoute: false,
    };

    this.projection = 'EPSG:3857';

    const layerService = new LayerService(
      ConfigReader.readConfig([
        {
          name: 'Basemap',
          visible: true,
          isBaseLayer: true,
          data: {
            type: 'mapbox',
            url: `https://maps.geops.io/styles/travic/style.json?key=${APIKey}`,
          },
        },
      ]),
    );

    // Define stop vectorLayer.
    this.markerVectorSource = new VectorSource({});
    layerService.addLayer(
      new Layer({
        key: 'markerLayer',
        name: 'markerLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.markerVectorSource,
        }),
      }),
    );

    // Define route vectorLayer.
    this.routeVectorSource = new VectorSource({
      features: [],
    });
    layerService.addLayer(
      new Layer({
        key: 'routeLayer',
        name: 'routeLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.routeVectorSource,
        }),
      }),
    );

    this.markerVectorLayer = layerService.getLayer('markerLayer');
    this.routeVectorLayer = layerService.getLayer('routeLayer');
    this.layers = [...layerService.getLayers()];

    const translate = new Translate({
      layers: [this.markerVectorLayer.olLayer],
      hitTolerance: 3,
    });

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
        const isCoordPresent = element => {
          let el;
          let coords;
          if (!Array.isArray(element)) {
            el = element.split(',').map(f => f.split('$')[0]);
            coords = to4326(id.slice().reverse());
          } else {
            el = element;
            coords = id.slice().reverse();
          }
          return el[0] === coords[0] && el[1] === coords[1];
        };
        featureIndex = currentStops.findIndex(isCoordPresent);
      }

      if (featureIndex !== -1) {
        if (typeof newCurrentStops[featureIndex] === 'string') {
          const stopFloor = newCurrentStops[featureIndex].match(FLOOR_REGEX);

          newCurrentStops[featureIndex] = `${to4326(evt.coordinate).join(
            ',',
          )}${stopFloor || ''}`;
        } else {
          newCurrentStops[featureIndex] = evt.coordinate;
        }

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
      }
      onSetCurrentStops(newCurrentStops);
      onSetCurrentStopsGeoJSON(newCurentStopsGeoJSON);
    });

    /*
    const modify = new Modify({
      source: this.routeVectorSource,
      pixelTolerance: 2,
      condition: () => {
        const { currentMot } = this.props;
        return !GRAPHHOPPER_MOTS.includes(currentMot);
      },
      style: () => {
        const { currentMot } = this.props;
        return pointStyleFunction(currentMot);
      },
    });

    modify.on('modifystart', evt => {
      // save start point to find where to add the new HOP!
      this.initialRouteDrag = {
        features: evt.features.getArray(),
        coordinate: evt.mapBrowserEvent.coordinate,
      };
    });

    modify.on('modifyend', evt => {
      const { features } = this.initialRouteDrag;
      const {
        currentMot,
        currentStops,
        currentStopsGeoJSON,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;
      const updatedCurrentStops = _.clone(currentStops);
      const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
      let newHopIdx = -1;

      // No drag for foot/car for now on.
      if (!GRAPHHOPPER_MOTS.includes(currentMot)) {
        const flatCoords = features
          .map(f => f.getGeometry())
          .map(lineString => {
            return [
              ...lineString.getFirstCoordinate(),
              ...lineString.getLastCoordinate(),
            ];
          });

        const closestSegment = this.routeVectorSource
          .getClosestFeatureToCoordinate(this.initialRouteDrag.coordinate)
          .getGeometry();

        const closestEdges = [
          ...closestSegment.getFirstCoordinate(),
          ...closestSegment.getLastCoordinate(),
        ];

        flatCoords.forEach((segment, idx) => {
          if (
            segment.length === closestEdges.length &&
            segment.every((value, index) => {
              return value === closestEdges[index];
            })
          ) {
            newHopIdx = idx + 1;
          }
        });
      }

      if (newHopIdx >= 0) {
        updatedCurrentStops.splice(
          newHopIdx,
          0,
          evt.mapBrowserEvent.coordinate,
        );

        if (updatedCurrentStopsGeoJSON[newHopIdx]) {
          const keys = Object.keys(updatedCurrentStopsGeoJSON).reverse();
          keys.forEach(k => {
            if (parseInt(k, 10) >= newHopIdx) {
              updatedCurrentStopsGeoJSON[`${parseInt(k, 10) + 1}`] =
                updatedCurrentStopsGeoJSON[k];
            }
            if (parseInt(k, 10) === newHopIdx) {
              updatedCurrentStopsGeoJSON[newHopIdx] = {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {
                      id: evt.mapBrowserEvent.coordinate.slice().reverse(),
                      type: 'coordinates',
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: evt.mapBrowserEvent.coordinate,
                    },
                  },
                ],
              };
            }
          });
        }

        onSetCurrentStops(updatedCurrentStops);
        onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
      }
      this.initialRouteDrag = null;
    });
    */

    const interactions = defaultInteractions().extend([translate]);

    this.map = new Map({
      controls: [],
      interactions,
    });

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
      if (this.hoveredFeature) {
        this.hoveredFeature = null;
        this.setState({ hoveredStationOpen: false, hoveredStationName: '' });
      }

      if (this.hoveredRoute) {
        this.routeVectorSource
          .getFeatures()
          .forEach(f => f.setStyle(lineStyleFunction(f.get('floor'), true)));
        this.hoveredRoute = null;
      }
      const hovFeats = this.map.getFeaturesAtPixel(evt.pixel);

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
        if (
          ['MultiLineString', 'LineString'].includes(
            feature.getGeometry().getType(),
          )
        ) {
          this.hoveredRoute = feature;
          this.routeVectorSource
            .getFeatures()
            .forEach(f => f.setStyle(lineStyleFunction(f.get('floor')), true));
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
    const { currentStopsGeoJSON, currentMot, floorInfo } = this.props;
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
        this.markerVectorSource.getFeatures().forEach((f, idx) => {
          let floor = '0';
          if (floorInfo[idx]) {
            const floorNb = floorInfo[idx].match(FLOOR_REGEX_CAPTURE);
            floor = floorNb ? floorNb[1] : '0';
          }
          f.setStyle(pointStyleFunction(floor));
        });
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

  onMapMoved = evt => {
    const { center, onSetCenter } = this.props;
    const newCenter = evt.map.getView().getCenter();

    if (center[0] !== newCenter[0] || center[1] !== newCenter[1]) {
      onSetCenter(newCenter);
    }
  };

  onFeaturesClick = feats => {
    const { onSetIsRouteInfoOpen } = this.props;
    const lines = feats.filter(f => f.getGeometry().getType() === 'LineString');
    if (lines.length) {
      onSetIsRouteInfoOpen(true);
    }
  };

  onFeaturesHover(features) {
    if (this.mapRef) {
      this.mapRef.current.node.current.style.cursor = features.length
        ? 'pointer'
        : 'inherit';
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
      // APIKey,
      floorInfo,
      onShowNotification,
      onSetShowLoadingBar,
      onSetSelectedRoute,
      onSetIsRouteInfoOpen,
    } = this.props;

    onSetShowLoadingBar(true);

    // find the index and use this instead.
    Object.keys(currentStopsGeoJSON).forEach((key, idx) => {
      if (currentStopsGeoJSON[key].features) {
        // If the current item is a point selected on the map, not a station.
        hops.push(
          `${to4326(currentStopsGeoJSON[key].features[0].geometry.coordinates)
            .slice()
            .reverse()}${floorInfo[idx] || ''}`,
        );
      } else if (!GRAPHHOPPER_MOTS.includes(currentMot)) {
        hops.push(`!${currentStopsGeoJSON[key].properties.uid}`);
      } else {
        hops.push(`${currentStopsGeoJSON[key].properties.name}`);
      }
    });

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    /*
    const reqUrl = `${routingUrl}?via=${hops.join(
      '|',
    )}&mot=${currentMot}&resolve-hops=false&key=${APIKey}&features={%22elevation%22:%20{}}`;
    */
    const reqUrl = `${routingUrl}?via=${hops.join('|')}`;

    fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        onSetShowLoadingBar(false);
        if (response.error) {
          onShowNotification("Couldn't find route", 'error');
          onSetSelectedRoute(null);
          onSetIsRouteInfoOpen(false);
          return;
        }
        // A route was found, prepare to draw it.
        this.routeVectorSource.clear();
        const format = new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        this.routeVectorSource.addFeatures(format.readFeatures(response));
        this.setIsActiveRoute(!!this.routeVectorSource.getFeatures().length);
        onSetSelectedRoute(this.routeVectorSource.getFeatures()[0]);

        this.routeVectorSource
          .getFeatures()
          .forEach(f => f.setStyle(lineStyleFunction(f.get('floor'), false)));
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.warn(`Abort ${reqUrl}`);
          return;
        }
        onSetShowLoadingBar(false);
        onSetIsRouteInfoOpen(false);
        onSetSelectedRoute(null);
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
    const {
      center,
      mots,
      APIKey,
      selectedRoute,
      isRouteInfoOpen,
      stationSearchUrl,
    } = this.props;

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
        <BasicMap
          ref={this.mapRef}
          center={center}
          layers={this.layers}
          // To activate when elevation info ready
          // onFeaturesClick={feats => this.onFeaturesClick(feats)}
          onFeaturesHover={evt => this.onFeaturesHover(evt)}
          onMapMoved={evt => this.onMapMoved(evt)}
          zoom={zoom}
          tabIndex={null}
          map={this.map}
          viewOptions={{
            projection: this.projection,
          }}
        />
        {isRouteInfoOpen && selectedRoute ? (
          <RouteInfosDialog route={selectedRoute} />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    center: state.MapReducer.center,
    floorInfo: state.MapReducer.floorInfo,
    selectedRoute: state.MapReducer.selectedRoute,
    isRouteInfoOpen: state.MapReducer.isRouteInfoOpen,
    currentMot: state.MapReducer.currentMot,
    currentStops: state.MapReducer.currentStops,
    currentStopsGeoJSON: state.MapReducer.currentStopsGeoJSON,
    isFieldFocused: state.MapReducer.isFieldFocused,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetCenter: center => dispatch(actions.setCenter(center)),
    onSetCurrentStops: currentStops =>
      dispatch(actions.setCurrentStops(currentStops)),
    onSetCurrentStopsGeoJSON: currentStopsGeoJSON =>
      dispatch(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)),
    onSetClickLocation: clickLocation =>
      dispatch(actions.setClickLocation(clickLocation)),
    onShowNotification: (notificationMessage, notificationType) =>
      dispatch(actions.showNotification(notificationMessage, notificationType)),
    onSetShowLoadingBar: showLoadingBar =>
      dispatch(actions.setShowLoadingBar(showLoadingBar)),
    onSetIsRouteInfoOpen: isRouteInfosOpen =>
      dispatch(actions.setIsRouteInfoOpen(isRouteInfosOpen)),
    onSetSelectedRoute: selectedRoute =>
      dispatch(actions.setSelectedRoute(selectedRoute)),
  };
};

MapComponent.propTypes = {
  center: propTypeCoordinates.isRequired,
  floorInfo: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedRoute: PropTypes.instanceOf(Feature),
  isRouteInfoOpen: PropTypes.bool.isRequired,
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  onSetCenter: PropTypes.func.isRequired,
  onSetClickLocation: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  onSetShowLoadingBar: PropTypes.func.isRequired,
  onSetIsRouteInfoOpen: PropTypes.func.isRequired,
  onSetSelectedRoute: PropTypes.func.isRequired,
  onSetCurrentStops: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops.isRequired,
  currentStopsGeoJSON: propTypeCurrentStopsGeoJSON.isRequired,
  isFieldFocused: PropTypes.bool.isRequired,
  routingUrl: PropTypes.string.isRequired,
  currentMot: PropTypes.string.isRequired,
};

MapComponent.defaultProps = {
  selectedRoute: null,
};

export { FLOOR_REGEX, FLOOR_REGEX_CAPTURE };
export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
