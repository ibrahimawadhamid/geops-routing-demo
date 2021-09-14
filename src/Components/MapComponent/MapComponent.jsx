import React, { Component } from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import { Layer, MapboxLayer } from 'mobility-toolbox-js/ol';
import BasicMap from 'react-spatial/components/BasicMap';
import { Map, Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import _ from 'lodash/core';
import { Point } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import {
  defaults as defaultInteractions,
  Translate,
  Modify,
} from 'ol/interaction';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import RoutingMenu, { FLOOR_REGEX, FLOOR_REGEX_CAPTURE } from '../RoutingMenu';
import RouteInfosDialog from '../RouteInfosDialog';
import FloorSwitcher from '../FloorSwitcher';
import LevelLayer from '../../layers/LevelLayer';
import {
  lineStyleFunction,
  pointStyleFunction,
} from '../../config/styleConfig';
import {
  propTypeCoordinates,
  propTypeCurrentStops,
  propTypeCurrentStopsGeoJSON,
} from '../../store/prop-types';
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
const zoom = 6;

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
    const {
      APIKey,
      onSetClickLocation,
      olMap,
      activeFloor,
      layerService,
    } = this.props;
    this.map = olMap;
    this.hoveredFeature = null;
    this.hoveredRoute = null;
    this.initialRouteDrag = null;
    this.state = {
      hoveredStationOpen: false,
      hoveredStationName: '',
      isActiveRoute: false,
      hoveredPoint: null,
    };

    this.onHighlightPoint = this.onHighlightPoint.bind(this);

    this.projection = 'EPSG:3857';

    const dataLayer = new MapboxLayer({
      name: 'Basemap',
      visible: true,
      isBaseLayer: true,
      url: `https://maps.geops.io/styles/base_bright_v2/style.json?key=${APIKey}`,
    });

    layerService.addLayer(dataLayer);

    // Define LevelLayer
    const geschosseLayer = new Layer({
      name: 'ch.sbb.geschosse',
      visible: true,
    });

    geschosseLayer.children = [-4, -3, -2, -1, 0, '2D', 1, 2, 3, 4].map(
      level => {
        return new LevelLayer({
          name: `ch.sbb.geschosse${level}`,
          visible: level === activeFloor,
          mapboxLayer: dataLayer,
          styleLayersFilter: ({ metadata }) =>
            metadata && metadata['geops.filter'],
          level,
          properties: {
            radioGroup: 'ch.sbb.geschosse-layer',
          },
        });
      },
    );
    layerService.addLayer(geschosseLayer);

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

    // Define highlight vectorLayer.
    this.highlightVectorSource = new VectorSource({});
    layerService.addLayer(
      new Layer({
        key: 'highlightLayer',
        name: 'highlightLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.highlightVectorSource,
        }),
      }),
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

    this.markerVectorLayer = layerService.getLayer('markerLayer');
    this.routeVectorLayer = layerService.getLayer('routeLayer');
    this.layers = [...layerService.getLayers()];

    const translate = new Translate({
      layers: [this.markerVectorLayer.olLayer],
      hitTolerance: 3,
    });

    translate.on('translateend', evt => {
      const {
        tracks,
        onSetTracks,
        currentStops,
        currentStopsGeoJSON,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;
      const newTracks = _.clone(tracks);
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
            el = element.split(',');
            coords = to4326(id.slice().reverse());
          } else {
            el = element;
            coords = id.slice().reverse();
          }
          return el[0] === coords[0] && el[1] === coords[1];
        };
        featureIndex = currentStops.findIndex(isCoordPresent);
      }

      if (featureIndex === -1) {
        return;
      }

      if (typeof newCurrentStops[featureIndex] === 'string') {
        const stopFloor = newCurrentStops[featureIndex].match(FLOOR_REGEX);

        newCurrentStops[featureIndex] = `${to4326(evt.coordinate).join(
          ',',
        )}${stopFloor || ''}`;
      } else {
        newCurrentStops[featureIndex] = evt.coordinate;
      }

      newTracks[featureIndex] = '';
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
      onSetTracks(newTracks);
      onSetCurrentStops(newCurrentStops);
      onSetCurrentStopsGeoJSON(newCurentStopsGeoJSON);
    });

    const modify = new Modify({
      source: this.routeVectorSource,
      pixelTolerance: 4,
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
        tracks,
        currentStops,
        currentStopsGeoJSON,
        onSetTracks,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;
      const newTracks = [...tracks];
      const updatedCurrentStops = _.clone(currentStops);
      const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
      let newHopIdx = -1;

      // Drag
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

      if (newHopIdx >= 0) {
        updatedCurrentStops.splice(
          newHopIdx,
          0,
          evt.mapBrowserEvent.coordinate,
        );

        newTracks.splice(newHopIdx, 0, '');

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
        onSetTracks(newTracks);
        onSetCurrentStops(updatedCurrentStops);
        onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
      }
      this.initialRouteDrag = null;
    });

    const interactions = defaultInteractions().extend([translate, modify]);
    interactions.getArray().forEach(interaction => {
      this.map.addInteraction(interaction);
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
          padding: [50, 50, 50, 50],
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
        if (currentMot === 'foot') {
          this.routeVectorSource
            .getFeatures()
            .forEach(f =>
              f.setStyle(lineStyleFunction(currentMot, true, f.get('floor'))),
            );
        } else {
          this.routeVectorLayer.olLayer.setStyle(
            lineStyleFunction(currentMot, false),
          );
        }
        this.hoveredRoute = null;
        this.setState({
          hoveredPoint: null,
        });
      }
      const hovFeats = this.map.getFeaturesAtPixel(evt.pixel, {
        hitTolerance: 2,
      });

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

          this.setState({
            hoveredPoint: evt.coordinate,
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
    const {
      currentStopsGeoJSON,
      currentMot,
      floorInfo,
      searchMode,
      tracks,
    } = this.props;
    const currentMotChanged = currentMot && currentMot !== prevProps.currentMot;
    const tracksChanged = tracks !== prevProps.tracks;
    const floorInfoChanged = floorInfo !== prevProps.floorInfo;
    const searchModeChanged = searchMode !== prevProps.searchMode;
    const currentStopsGeoJSONChanged =
      currentStopsGeoJSON &&
      currentStopsGeoJSON !== prevProps.currentStopsGeoJSON;
    if (
      floorInfoChanged ||
      currentMotChanged ||
      currentStopsGeoJSONChanged ||
      searchModeChanged ||
      tracksChanged
    ) {
      this.markerVectorSource.clear();
      Object.keys(currentStopsGeoJSON).forEach(key => {
        this.markerVectorSource.addFeatures(
          new GeoJSON().readFeatures(currentStopsGeoJSON[key]),
        );
        if (currentMot === 'foot') {
          this.markerVectorSource.getFeatures().forEach((f, idx) => {
            let floor = '0';
            if (floorInfo[idx]) {
              const floorNb = floorInfo[idx].match(FLOOR_REGEX_CAPTURE);
              floor = floorNb ? floorNb[1] : '0';
            }
            f.setStyle(pointStyleFunction(currentMot, floor));
          });
        } else {
          this.markerVectorSource
            .getFeatures()
            .forEach(f => f.setStyle(pointStyleFunction(currentMot)));
        }
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

  /*
   *  Highlight a point on the route.
   */
  onHighlightPoint(coords) {
    const { currentMot } = this.props;

    this.highlightVectorSource.clear();
    const feat = new Feature({
      geometry: new Point(coords),
    });
    feat.setStyle(pointStyleFunction(currentMot));
    this.highlightVectorSource.addFeatures([feat]);
  }

  onFeaturesHover(features) {
    if (this.map.getTargetElement()) {
      this.map.getTargetElement().style.cursor = features.length
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
  drawNewRoute = useElevation => {
    const hops = [];
    const {
      currentStopsGeoJSON,
      routingUrl,
      currentMot,
      APIKey,
      resolveHops,
      floorInfo,
      onShowNotification,
      onSetShowLoadingBar,
      onSetSelectedRoutes,
      searchMode,
      tracks,
      isRouteInfoOpen,
    } = this.props;

    onSetShowLoadingBar(true);

    // find the index and use this instead.
    Object.keys(currentStopsGeoJSON).forEach((key, idx) => {
      if (currentStopsGeoJSON[key].features) {
        // If the current item is a point selected on the map, not a station.
        hops.push(
          `${to4326(currentStopsGeoJSON[key].features[0].geometry.coordinates)
            .slice()
            .reverse()}${
            floorInfo && floorInfo[idx] !== null
              ? `${floorInfo[idx] ? `$${floorInfo[idx]}` : ''}`
              : ''
          }`,
        );
      } else {
        hops.push(
          `!${currentStopsGeoJSON[key].properties.uid}${
            tracks[idx] !== null
              ? `${tracks[idx] ? `$${tracks[idx]}` : ''}`
              : ''
          }`,
        );
      }
    });

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const calculateElevation = !!(isRouteInfoOpen || useElevation);
    let reqUrl =
      `${routingUrl}` +
      `?via=${hops.join(
        '|',
      )}&mot=${currentMot}&resolve-hops=${resolveHops}&key=${APIKey}` +
      `&elevation=${calculateElevation ? 1 : 0}` +
      `&interpolate_elevation=${calculateElevation}` +
      `&length=true&coord-radius=100.0&coord-punish=1000.0` +
      `&barrierefrei=${searchMode === 'barrier-free' ? 'true' : 'false'}`;

    const { graph } = qs.parse(window.location.search);

    if (graph) {
      reqUrl += `&graph=${graph}`;
    }

    return fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        onSetShowLoadingBar(false);
        if (response.error) {
          onShowNotification("Couldn't find route", 'error');
          onSetSelectedRoutes([]);
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

        this.routeVectorSource
          .getFeatures()
          .forEach(f =>
            f.setStyle(lineStyleFunction(currentMot, false, f.get('floor'))),
          );

        onSetSelectedRoutes(this.routeVectorSource.getFeatures());

        this.routeVectorLayer.olLayer.setStyle(
          lineStyleFunction(currentMot, false),
        );
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.warn(`Abort ${reqUrl}`);
          return;
        }
        onSetShowLoadingBar(false);
        onSetSelectedRoutes([]);
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
      selectedRoutes,
      isRouteInfoOpen,
      stationSearchUrl,
    } = this.props;

    const {
      isActiveRoute,
      hoveredPoint,
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
          onDrawNewRoute={this.drawNewRoute}
          APIKey={APIKey}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={hoveredStationOpen}
          message={hoveredStationName}
        />
        <BasicMap
          center={center}
          layers={this.layers}
          onMapMoved={evt => this.onMapMoved(evt)}
          onFeaturesHover={evt => this.onFeaturesHover(evt)}
          zoom={zoom}
          tabIndex={null}
          map={this.map}
          viewOptions={{
            projection: this.projection,
          }}
        />
        {isRouteInfoOpen && selectedRoutes.length ? (
          <RouteInfosDialog
            routes={selectedRoutes}
            hoveredCoords={hoveredPoint}
            onHighlightPoint={this.onHighlightPoint}
            clearHighlightPoint={() => {
              this.highlightVectorSource.clear();
            }}
          />
        ) : null}
        <FloorSwitcher />
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    center: state.MapReducer.center,
    activeFloor: state.MapReducer.activeFloor,
    floorInfo: state.MapReducer.floorInfo,
    selectedRoute: state.MapReducer.selectedRoute,
    selectedRoutes: state.MapReducer.selectedRoutes,
    isRouteInfoOpen: state.MapReducer.isRouteInfoOpen,
    currentMot: state.MapReducer.currentMot,
    currentStops: state.MapReducer.currentStops,
    currentStopsGeoJSON: state.MapReducer.currentStopsGeoJSON,
    isFieldFocused: state.MapReducer.isFieldFocused,
    resolveHops: state.MapReducer.resolveHops,
    olMap: state.MapReducer.olMap,
    searchMode: state.MapReducer.searchMode,
    tracks: state.MapReducer.tracks,
    layerService: state.MapReducer.layerService,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetCenter: center => dispatch(actions.setCenter(center)),
    onSetTracks: tracks => dispatch(actions.setTracks(tracks)),
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
    onSetSelectedRoutes: selectedRoutes =>
      dispatch(actions.setSelectedRoutes(selectedRoutes)),
  };
};

MapComponent.defaultProps = {
  center: [47.99822, 7.84049],
};

MapComponent.propTypes = {
  center: propTypeCoordinates,
  activeFloor: PropTypes.string.isRequired,
  floorInfo: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedRoutes: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
  isRouteInfoOpen: PropTypes.bool.isRequired,
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  onSetCenter: PropTypes.func.isRequired,
  onSetTracks: PropTypes.func.isRequired,
  onSetClickLocation: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  onSetShowLoadingBar: PropTypes.func.isRequired,
  onSetSelectedRoutes: PropTypes.func.isRequired,
  onSetCurrentStops: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops.isRequired,
  currentStopsGeoJSON: propTypeCurrentStopsGeoJSON.isRequired,
  isFieldFocused: PropTypes.bool.isRequired,
  routingUrl: PropTypes.string.isRequired,
  currentMot: PropTypes.string.isRequired,
  resolveHops: PropTypes.bool.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.string).isRequired,
  olMap: PropTypes.instanceOf(Map).isRequired,
  searchMode: PropTypes.string.isRequired,
  layerService: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
